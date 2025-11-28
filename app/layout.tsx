import './globals.css'
import { Providers } from "./providers";

export const metadata = {
  title: 'WoW Tracker',
  description: 'Track your mythic plus progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
         {/* Wowhead Scripts */}
         <script dangerouslySetInnerHTML={{__html: `var whTooltips = {colorLinks: true, iconizeLinks: true, renameLinks: true};`}} />
         <script src="https://wow.zamimg.com/js/tooltips.js"></script>
      </head>
      <body>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  )
}