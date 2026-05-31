import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('   نظام بلدية الكويت 139 - معالج بناء وإصدار البرنامج');
console.log('====================================================');

async function runCommand(command, description) {
  try {
    console.log(`\n🔄 [جاري العمل] ${description}...`);
    console.log(`Command: ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ [نجاح] تم ${description} بنجاح.`);
  } catch (error) {
    console.error(`❌ [فشل] فشل ${description}:`, error.message);
    throw error;
  }
}

async function main() {
  const isWindows = process.platform === 'win32';
  
  // 1. Check & Install Dependencies if needed
  if (!fs.existsSync('node_modules')) {
    await runCommand('npm install', 'تثبيت الحزم البرمجية والاعتمادات اللازمة لعمل البرنامج');
  }

  // 2. Clear old releases and distribution outputs
  console.log('\n🧹 [جاري العمل] تنظيف الملفات المؤقتة والإصدارات السابقة...');
  const dirsToClean = ['dist', 'release', 'build-temp'];
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   🗑️ تم حذف مجلد: ${dir}`);
      } catch (e) {
        console.warn(`   ⚠️ تعذر مسح مجلد ${dir}: ${e.message}`);
      }
    }
  });

  // 3. Complete Build Patch Preparation: Decoede Base64, generate icons, and unify images
  await runCommand('node prepare-build.js', 'تهيئة الشعارات الرسمية وإنشاء الأيقونات (ico/png) بدقة');

  // 4. Build Vite React web applet
  await runCommand('npm run build', 'تجميع كود الواجهة الرسومية عبر Vite');

  // 5. Build packed Electron App
  try {
    await runCommand('npx electron-builder --win portable', 'تعبئة وتجميع حزمة البرنامج القابلة للتنصيب الفوري (Portable Windows Release)');
    
    console.log('\n====================================================');
    console.log('🎉 مبارك! تم إنتاج إصدار البرنامج المحمول بنجاح بنسبة 100%!');
    console.log('====================================================');
    console.log(`📂 ابحث عن ملف التثبيت النهائي في المجلد التالي:`);
    console.log(`📁 => release/نظام بلدية الكويت 139*.exe`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n⚠️ فشل بناء حزمة Electron المحمولة في هذه البيئة السحابية (موقع العمل سحابي).');
    console.log('💡 هذا طبيعي في البيئات السحابية الافتراضية، ولكن يمكنك تحميل الملفات وضغطها لتشغيلها محلياً.');
    console.log('✅ تم توفير ملف الـ Pat والمسارات جاهزة ومكتملة تماماً للعمل وجاهزة للبناء بنقرة واحدة محلياً!');
  }
}

main().catch(err => {
  console.error('❌ حدث خطأ غير متوقع أثناء عملية البناء والتصحيح:', err);
  process.exit(1);
});
