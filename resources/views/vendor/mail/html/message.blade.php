<x-mail::layout>
    <x-slot:header>
        <x-mail::header :url="config('app.url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    {{ Illuminate\Mail\Markdown::parse($slot) }}

    @isset($subcopy)
        <x-slot:subcopy>
            <div style="margin-top: 12px; border-top: 1px solid #dbe3f1; padding-top: 14px; font-size: 13px; line-height: 1.6; color: #475569;">
                {{ Illuminate\Mail\Markdown::parse($subcopy) }}
            </div>
        </x-slot:subcopy>
    @endisset

    <x-slot:footer>
        <x-mail::footer>
            © {{ date('Y') }} {{ config('app.name') }}. Seluruh hak cipta dilindungi.
        </x-mail::footer>
    </x-slot:footer>
</x-mail::layout>
