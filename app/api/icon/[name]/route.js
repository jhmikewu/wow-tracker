import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    // In Next.js 15+, params is a Promise
    const { name } = await params;
    const iconName = name.replace('.jpg', ''); // Remove extension if present
    
    // Define where we save icons (in your public folder)
    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    const filePath = path.join(iconsDir, `${iconName}.jpg`);

    // 1. If we already have it, serve it from disk
    if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    }

    // 2. If not, download it from Wowhead (Zamimg)
    try {
        // Create the directory if it doesn't exist
        if (!fs.existsSync(iconsDir)) {
            fs.mkdirSync(iconsDir, { recursive: true });
        }

        const remoteUrl = `https://wow.zamimg.com/images/wow/icons/medium/${iconName}.jpg`;
        const res = await fetch(remoteUrl);
        
        if (!res.ok) {
            // Return a placeholder or 404 if icon doesn't exist
            return new NextResponse('Icon not found', { status: 404 });
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Save it to disk for next time
        fs.writeFileSync(filePath, buffer);

        // 4. Serve the downloaded image
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error("Error fetching icon:", error);
        return new NextResponse('Error fetching icon', { status: 500 });
    }
}