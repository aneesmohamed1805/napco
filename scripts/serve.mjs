import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||8080);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
try { await fs.access(path.join(root,'index.html')); } catch { throw new Error('Run npm run build before npm run preview.'); }
const server=http.createServer(async(req,res)=>{
  try {
    const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let local=path.resolve(root,'.'+requested);
    if(local!==root&&!local.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    let status=200;
    try {
      const stat=await fs.stat(local);
      if(stat.isDirectory()) local=path.join(local,'index.html');
      await fs.access(local);
    } catch {status=404;local=path.join(root,'404.html');}
    const data=await fs.readFile(local);
    res.writeHead(status,{'Content-Type':types[path.extname(local)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
    res.end(req.method==='HEAD'?undefined:data);
  } catch {res.writeHead(400);res.end('Bad request');}
});
server.listen(port,'127.0.0.1',()=>console.log(`NAPCO local preview: http://127.0.0.1:${port} (Ctrl+C to stop)`));
