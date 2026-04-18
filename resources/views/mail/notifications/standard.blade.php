@php
    $introLines = $introLines ?? [];
    $outroLines = $outroLines ?? [];
@endphp

<x-mail::message>
@if (!empty($headline))
# {{ $headline }}
@endif

{{ $greeting ?? 'Yth. Pengguna,' }}

@foreach ($introLines as $line)
{{ $line }}

@endforeach

@if (!empty($actionText) && !empty($actionUrl))
<x-mail::button :url="$actionUrl">
{{ $actionText }}
</x-mail::button>
@endif

@foreach ($outroLines as $line)
{{ $line }}

@endforeach

Hormat kami,  
{{ config('app.name') }}
</x-mail::message>
