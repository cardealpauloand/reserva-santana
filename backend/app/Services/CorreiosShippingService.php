<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CorreiosShippingService
{
    
    public function calculateQuotes(string $destinationZip, array $items): array
    {
        $originZip = $this->normalizeZip(config('shipping.origin_zip'));
        $destZip = $this->normalizeZip($destinationZip);

        
        $defaults = config('shipping.default_dimensions_cm');
        $defaultWeight = (float) config('shipping.default_item_weight_kg');

        $totalWeight = 0.0; 
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

        
        $weightGrams = max(30, (int) round($totalWeight * 1000)); 

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
                
                
                
                $cep = $destZip; 
                $prefix2 = (int) substr($cep, 0, 2);
                $regionFactor = $this->regionFactor($prefix2);

                $kg = max(0.03, $weightGrams / 1000);
                $base = 14.9 * $regionFactor; 
                $perKg = 7.5 * max(1.0, $regionFactor - 0.1); 
                $serviceFactor = match ($code) {
                    '04014' => 1.35, 
                    '04510' => 1.0,  
                    default => 1.15,
                };
                $price = round(($base + $perKg * $kg) * $serviceFactor, 2);

                
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
        
        
        
        
        return match (true) {
            $prefix2 >= 80 && $prefix2 <= 87 => 1.0,   
            $prefix2 >= 88 && $prefix2 <= 89 => 1.05,  
            $prefix2 >= 90 && $prefix2 <= 99 => 1.15,  
            $prefix2 >= 01 && $prefix2 <= 19 => 1.25,  
            $prefix2 >= 20 && $prefix2 <= 29 => 1.35,  
            $prefix2 >= 30 && $prefix2 <= 39 => 1.45,  
            $prefix2 >= 40 && $prefix2 <= 59 => 1.6,   
            $prefix2 >= 60 && $prefix2 <= 69 => 1.7,   
            $prefix2 >= 70 && $prefix2 <= 79 => 1.4,   
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
        
        $url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';

        $params = [
            'nCdEmpresa' => '', 
            'sDsSenha' => '',    
            'nCdServico' => $serviceCode, 
            'sCepOrigem' => $originZip,
            'sCepDestino' => $destZip,
            'nVlPeso' => max(0.03, $weightGrams / 1000), 
            'nCdFormato' => 1, 
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
        
        $normalized = str_replace(['.', ','], ['', '.'], $value);
        return (float) $normalized;
    }
}
