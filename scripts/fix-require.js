const fs=require('fs');
const src=fs.readFileSync('scripts/build-learn.js','utf8');
const idx=src.indexOf("require('fs')");
console.log('fs require ctx:', JSON.stringify(src.substring(idx-8, idx+80)));
const hasHeader=src.includes("require('./header')");
console.log('has header require:', hasHeader);
// Add it if missing
if(!hasHeader){
  const newSrc=src.replace(
    "const fs   = require('fs');\r\nconst path = require('path');",
    "const fs   = require('fs');\r\nconst path = require('path');\r\nconst { buildHeader, buildSharedScript, buildHead } = require('./header');"
  );
  const added=newSrc.includes("require('./header')");
  console.log('added (CRLF):', added);
  if(added){ fs.writeFileSync('scripts/build-learn.js',newSrc,'utf8'); console.log('written'); }
  else{
    // Try LF only
    const newSrc2=src.replace(
      "const fs   = require('fs');\nconst path = require('path');",
      "const fs   = require('fs');\nconst path = require('path');\nconst { buildHeader, buildSharedScript, buildHead } = require('./header');"
    );
    console.log('added (LF):', newSrc2.includes("require('./header')"));
    if(newSrc2.includes("require('./header')")){
      fs.writeFileSync('scripts/build-learn.js',newSrc2,'utf8');
      console.log('written (LF)');
    }
  }
}
