<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#050510">

        <title>{{ config('app.name', 'Steve Marvin') }} | Supervisor Brand Activation & Event Management</title>
        <meta name="description" content="Portofolio Steve Marvin — Supervisor Brand Activation di GOC (Purbasari, Amara, Onyx, CleanFace), Ex KANZLER (Cimory Group), spesialis Event Management & Brand Activation.">

        <!-- Google Fonts API -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet">

        <link rel="icon" type="image/png" href="/assets/frontCard.png">

        <!-- Laravel Vite & React Refresh -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="bg-[#050510] text-[#e2e8f0] selection:bg-sky-500/30 selection:text-white font-sans antialiased overflow-x-hidden min-h-screen">
        <div id="root"></div>
    </body>
</html>
