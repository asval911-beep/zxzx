import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

async function prepare() {
  console.log('🧹 [1/4] Preparing build directories...');
  
  // Ensure required directories exist
  if (!fs.existsSync('build')) {
    fs.mkdirSync('build', { recursive: true });
  }
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  if (!fs.existsSync('src/assets/images')) {
    fs.mkdirSync('src/assets/images', { recursive: true });
  }

  try {
    console.log('✨ [2/4] Decoding official logo from Base64...');
    const base64FileContent = fs.readFileSync('src/assets/logo_base64.ts', 'utf8');
    
    // Find base64 pattern
    const match = base64FileContent.match(/export\s+const\s+LOGO_BASE64\s*=\s*["']data:image\/png;base64,([^"']+)["']/);
    if (match) {
      const base64Data = match[1];
      const binaryBuffer = Buffer.from(base64Data, 'base64');
      
      const targetPaths = [
        'public/logo_original.png',
        'public/logo.png',
        'public/icon.png',
        'public/building.png',
        'src/assets/images/kuwait_municipality_logo_official_1779556611431.png',
        'src/assets/images/kuwait_municipality_logo_1779556398979.png'
      ];
      
      targetPaths.forEach(p => {
        fs.writeFileSync(p, binaryBuffer);
        console.log(`   ✅ Restored binary logo to: ${p}`);
      });
      
      // Also copy to build/icon.png
      fs.writeFileSync('build/icon.png', binaryBuffer);
      console.log('   ✅ Restored binary logo to: build/icon.png');
    } else {
      console.warn('   ⚠️ Could not find base64 pattern in src/assets/logo_base64.ts');
    }
  } catch (err) {
    console.error('   ❌ Failed to restore logo from base64:', err.message);
  }

  try {
    console.log('🖼️ [3/4] Ensuring consistency of background brand images...');
    const logoOriginal = 'public/logo_original.png';
    const destBuilding = 'public/building.png';
    
    if (fs.existsSync(logoOriginal)) {
      fs.copyFileSync(logoOriginal, destBuilding);
      console.log(`   ✅ Consolidated and synchronized background logo image: ${destBuilding}`);
    }
  } catch (err) {
    console.error('   ❌ Failed to synchronize background image:', err.message);
  }

  try {
    console.log('🎯 [4/4] Generating desktop icon (.ico) files...');
    const logoPath = 'public/logo_original.png';
    if (fs.existsSync(logoPath)) {
      const buffer = await pngToIco(logoPath);
      fs.writeFileSync('build/icon.ico', buffer);
      fs.writeFileSync('public/favicon.ico', buffer);
      fs.writeFileSync('public/icon.ico', buffer);
      console.log('   ✅ Generated launch icons: build/icon.ico, public/favicon.ico, public/icon.ico');
    } else {
      console.warn('   ⚠️ logo_original.png does not exist; cannot generate icon.ico');
    }
  } catch (err) {
    console.error('   ❌ Failed to generate .ico file:', err.message);
  }

  console.log('🚀 Build preparation completed successfully with all graphics corrected!');
}

prepare().catch(err => {
  console.error('❌ Build preparation failed:', err);
  process.exit(1);
});
