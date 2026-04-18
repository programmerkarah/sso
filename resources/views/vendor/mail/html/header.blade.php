<tr>
<td class="header" style="padding: 26px 0 18px; text-align: center;">
<a href="{{ $url }}" style="display: inline-block; color: #0f172a; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; text-decoration: none;">
@if (trim($slot) === 'Laravel')
<img src="https://laravel.com/img/notification-logo.png" class="logo" alt="Laravel Logo">
@else
{{ $slot }}
@endif
</a>
</td>
</tr>
