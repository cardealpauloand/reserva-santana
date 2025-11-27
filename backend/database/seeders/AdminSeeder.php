<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    
    public function run(): void
    {
        
        $adminExists = UserRole::where('role', 'admin')->exists();

        if ($adminExists) {
            $this->command->warn('Admin user already exists. Skipping...');
            return;
        }

        
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'), 
        ]);

        
        Profile::create([
            'user_id' => $admin->id,
            'full_name' => 'Administrator',
            'phone' => null,
        ]);

        
        UserRole::create([
            'user_id' => $admin->id,
            'role' => 'admin',
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@example.com');
        $this->command->info('Password: password123');
        $this->command->warn('⚠️  IMPORTANT: Change the password in production!');
    }
}
