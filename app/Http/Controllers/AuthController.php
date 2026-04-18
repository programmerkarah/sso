<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SessionConcurrencyManager;
use App\Services\TrustedDeviceManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(
        protected SessionConcurrencyManager $sessionConcurrencyManager,
        protected TrustedDeviceManager $trustedDeviceManager,
    ) {}

    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($request->only('username', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        $request->session()->regenerate();

        // Update last login and finalize device trust
        $user = Auth::user();
        if ($user) {
            $this->trustedDeviceManager->finalizeSuccessfulLogin($request, $user);
            $this->sessionConcurrencyManager->activateLatestSession($request, $user->id);
        }

        if ($request->has('redirect_to')) {
            return redirect($request->redirect_to);
        }

        return redirect()->intended('/dashboard');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users', 'alpha_dash'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);

        if ($request->has('redirect_to')) {
            return redirect($request->redirect_to);
        }

        return redirect('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
