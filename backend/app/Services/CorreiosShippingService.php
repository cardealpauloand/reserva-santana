<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CorreiosShippingService
{
    /**
     * Calculate shipping quotes (price and deadline) for given items to destination CEP.
     * Items shape: [ ['quantity' => int, 'weight_kg' => ?float, 'dimensions_cm' => ['length' => int, 'width' => int, 'height' => int, 'diameter' => int?] ] ]
     * Returns: array of ['service_code','service_name','price','deadline_days']
     */
    public function calculateQuotes(string $destinationZip, array $items): array
    {
        $originZip = $this->normalizeZip(config('shipping.origin_zip'));
        $destZip = $this->normalizeZip($destinationZip);

        // Aggregate total weight and choose dimensions (simple heuristic: sum weight, max dimensions)
        $defaults = config('shipping.default_dimensions_cm');
        $defaultWeight = (float) config('shipping.default_item_weight_kg');

        $totalWeight = 0.0; // in Kg
        $length = (int) ($defaults['length'] ?? 20);
        $width = (int) ($defaults['width'] ?? 20);
        $height = (int) ($defaults['height'] ?? 15);
        $diameter = (int) ($defaults['diameter'] ?? 0);

        foreach ($items as $item) {
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $weightKg = (float) ($item['weight_kg'] ?? $defaultWeight);
            $totalWeight += ($weightKg * $qty);

            if (!empty($item['dimensions_cm']) && is_array($item['dimensions_cm'])) {
                $dims = $item['dimensions_cm'];
                $length = max($length, (int) ($dims['length'] ?? $length));
                $width = max($width, (int) ($dims['width'] ?? $width));
                $height = max($height, (int) ($dims['height'] ?? $height));
                $diameter = max($diameter, (int) ($dims['diameter'] ?? $diameter));
            }
        }

        // Convert weight to grams string as required by Correios API
        $weightGrams = max(30, (int) round($totalWeight * 1000)); // min 30g

        $serviceCodes = array_map('trim', (array) config('shipping.service_codes'));

        $liveEnabled = (bool) config('shipping.live_enabled');
        $responses = [];
        foreach ($serviceCodes as $code) {
            $result = $liveEnabled ? $this->fetchServiceQuote(
                $code,
                $originZip,
                $destZip,
                $weightGrams,
                $length,
                $height,
                $width,
                $diameter
            ) : null;

            if ($result === null) {
                // Fallback fictitious pricing based on distance from Campo Mourão-PR
                // Heuristic by CEP prefix region (very simplified):
                // PR (~80xxx), SC (~88xxx/89xxx), SP (01xxx-18xxx), RJ (20xxx-28xxx), Norte/Nordeste (higher)
                $cep = $destZip; // numeric 8-digits
                $prefix2 = (int) substr($cep, 0, 2);
                $regionFactor = $this->regionFactor($prefix2);

                $kg = max(0.03, $weightGrams / 1000);
                $base = 14.9 * $regionFactor; // base grows with distance
                $perKg = 7.5 * max(1.0, $regionFactor - 0.1); // per-kg also grows
                $serviceFactor = match ($code) {
                    '04014' => 1.35, // SEDEX premium
                    '04510' => 1.0,  // PAC economy
                    default => 1.15,
                };
                $price = round(($base + $perKg * $kg) * $serviceFactor, 2);

                // Deadlines grow by region and service type
                $deadlineBase = (int) ceil(2 * $regionFactor);
                $deadline = max(2, $code === '04014' ? $deadlineBase : $deadlineBase + 3);

                $result = [
                    'service_code' => $code,
                    'service_name' => $this->serviceName($code),
                    'price' => $price,
                    'deadline_days' => $deadline,
                ];
            }

            $responses[] = $result;
        }

        return $responses;
    }

    private function regionFactor(int $prefix2): float
    {
        // Campo Mourão-PR referencia (~ CEP 87300-000). Valores aproximados por proximidade.
        // 80-87 PR (mais barato), 88-89 SC (baixo), 85-86 também proximidade
        // 01-18 SP (mais caro que PR, mas menor que região Norte), 20-28 RJ/ES
        // 70-79 DF/GO/MT/MS (médio), 60-69 Norte (alto), 40-59 Nordeste (alto)
        return match (true) {
            $prefix2 >= 80 && $prefix2 <= 87 => 1.0,   // Paraná
            $prefix2 >= 88 && $prefix2 <= 89 => 1.05,  // Santa Catarina
            $prefix2 >= 90 && $prefix2 <= 99 => 1.15,  // RS
            $prefix2 >= 01 && $prefix2 <= 19 => 1.25,  // São Paulo
            $prefix2 >= 20 && $prefix2 <= 29 => 1.35,  // RJ/ES
            $prefix2 >= 30 && $prefix2 <= 39 => 1.45,  // MG
            $prefix2 >= 40 && $prefix2 <= 59 => 1.6,   // Nordeste
            $prefix2 >= 60 && $prefix2 <= 69 => 1.7,   // Norte (AM/PA/AC/RO/RR/AP)
            $prefix2 >= 70 && $prefix2 <= 79 => 1.4,   // Centro-Oeste
            default => 1.3,
        };
    }

    private function normalizeZip(string $zip): string
    {
        return preg_replace('/\D/', '', $zip ?? '') ?? '';
    }

    private function fetchServiceQuote(
        string $serviceCode,
        string $originZip,
        string $destZip,
        int $weightGrams,
        int $length,
        int $height,
        int $width,
        int $diameter
    ): ?array {
        // Correios CalcPrecoPrazo (XML) endpoint. Using JSON via "ws.correios.com.br" is limited; XML remains common.
        $url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';

        $params = [
            'nCdEmpresa' => '', // contract code (blank for retail)
            'sDsSenha' => '',    // password (blank for retail)
            'nCdServico' => $serviceCode, // e.g. 04014 SEDEX, 04510 PAC
            'sCepOrigem' => $originZip,
            'sCepDestino' => $destZip,
            'nVlPeso' => max(0.03, $weightGrams / 1000), // KG
            'nCdFormato' => 1, // 1=caja/pacote, 2=rolo/prisma, 3=envolope
            'nVlComprimento' => max(16, $length),
            'nVlAltura' => max(2, $height),
            'nVlLargura' => max(11, $width),
            'nVlDiametro' => max(0, $diameter),
            'sCdMaoPropria' => 'N',
            'nVlValorDeclarado' => 0,
            'sCdAvisoRecebimento' => 'N',
            'StrRetorno' => 'xml',
        ];

        $response = Http::timeout(10)->get($url, $params);

        if (!$response->ok()) {
            return null;
        }

        $xml = @simplexml_load_string($response->body());
        if ($xml === false || !isset($xml->cServico)) {
            return null;
        }

        // Handle single service case
        $service = $xml->cServico;
        $error = (string) ($service->Erro ?? '');
        if ($error && $error !== '0') {
            return null;
        }

        $price = (string) ($service->Valor ?? '0,00');
        $deadline = (int) (($service->PrazoEntrega ?? 0));

        return [
            'service_code' => $serviceCode,
            'service_name' => $this->serviceName($serviceCode),
            'price' => $this->parseBrazilianMoney($price),
            'deadline_days' => $deadline,
        ];
    }

    private function serviceName(string $code): string
    {
        return match ($code) {
            '04014' => 'SEDEX',
            '04510' => 'PAC',
            default => 'SERVIÇO ' . $code,
        };
    }

    private function parseBrazilianMoney(string $value): float
    {
        // e.g. "12,34" -> 12.34
        $normalized = str_replace(['.', ','], ['', '.'], $value);
        return (float) $normalized;
    }
}
