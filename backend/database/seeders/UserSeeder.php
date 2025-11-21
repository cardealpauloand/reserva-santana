<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Seed default application users.
     */
    public function run(): void
    {
        $startOfYear = now()->startOfYear();
        $now = now();

        $users = config('seed.users', []);

        if (empty($users)) {
            return;
        }

        foreach ($users as $userData) {
            $createdAt = $this->randomDateTimeBetween($startOfYear, $now);
            $updatedAt = $createdAt->copy()->addDays(random_int(0, 30))->addHours(random_int(0, 12));

            User::withoutTimestamps(function () use ($userData, $createdAt, $updatedAt) {
                $user = User::query()->firstOrNew(['email' => $userData['email']]);

                $attributes = [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                ];

                if (Schema::hasColumn($user->getTable(), 'email_verified_at')) {
                    $attributes['email_verified_at'] = $createdAt;
                }

                $user->fill($attributes);

                $user->created_at = $createdAt;
                $user->updated_at = $updatedAt;

                $user->save();
            });
        }
    }

    private function randomDateTimeBetween(Carbon $start, Carbon $end): Carbon
    {
        $timestamp = random_int($start->getTimestamp(), $end->getTimestamp());

        return Carbon::createFromTimestamp($timestamp);
    }
}
