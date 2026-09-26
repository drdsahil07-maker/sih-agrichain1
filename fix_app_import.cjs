const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.tsx', 'utf-8');
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
content = content.replace("import { useEffect } from 'react';\n", "");
fs.writeFileSync('frontend/src/App.tsx', content);
