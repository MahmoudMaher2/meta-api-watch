const fs = require('fs');

function testFix() {
  let content = fs.readFileSync('scripts/publish-article.js', 'utf-8');
  if (content.includes('ØªØªØ¨Ù‘Ø¹')) {
     console.log("Found corrupted string, testing fix...");
     let fixed = Buffer.from(content, 'latin1').toString('utf8');
     if (fixed.includes('تتبّع')) {
        console.log("Fix works!");
        fs.writeFileSync('scripts/publish-article.js', fixed, 'utf-8');
        console.log("publish-article.js fixed.");
     } else {
        console.log("Fix failed:", fixed.substring(0, 200));
     }
  } else {
     console.log("Not found.");
  }
}
testFix();

function fixMojibake(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('Ø') || content.includes('ðŸ')) {
     let fixed = Buffer.from(content, 'latin1').toString('utf8');
     fs.writeFileSync(filePath, fixed, 'utf-8');
     console.log(filePath + ' fixed.');
  }
}

fixMojibake('scripts/build-learn.js');
fixMojibake('scripts/patch-publish.js');
