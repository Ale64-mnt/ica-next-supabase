// TEMPORARY UPDATE SCRIPT - HOMEPAGE
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', '[locale]', 'page.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Nuova sezione immagine responsive
const newImageSection = `                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: 'clamp(140px, 18vw, 180px)', 
                      flexShrink: 0, 
                      overflow: 'hidden' 
                    }}>
                      {(news.thumb_url || news.image_url) ? (
                        <Image
                          src={news.thumb_url || news.image_url}
                          alt={news.image_alt || news.title}
                          fill
                          style={{ 
                            objectFit: 'cover'
                          }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '0.8rem'
                        }}>
                          📷
                        </div>
                      )}
                    </div>`;

// Trova e sostituisce la sezione immagine esistente
const regex = /<div style={{[^}]*position:[^}]*}}>[\s\S]*?<\/div>/;
content = content.replace(regex, newImageSection);

// Backup
fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));
// Scrivi nuovo contenuto
fs.writeFileSync(filePath, content);

console.log('✅ Homepage aggiornata con immagini responsive!');
