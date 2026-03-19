const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('react-hot-toast')) {
  code = code.replace('import { useState, useEffect } from "react";', 
    'import { useState, useEffect } from "react";\nimport { Toaster, toast } from "react-hot-toast";'
  );
}

if (!code.includes('<Toaster position="top-right" />')) {
  code = code.replace('<BrowserRouter>', '<BrowserRouter>\n      <Toaster position="top-right" />');
}

// Replace alert with toast.error
code = code.replace(/alert\((.*)\);/g, 'toast.error($1);');

// Insert specific toast.success triggers
code = code.replace(/setLeads\(\(prev\) => prev.filter\(\(l\) => l.id != id\)\);/g, 'setLeads((prev) => prev.filter((l) => l.id != id));\n        toast.success("Lead deleted successfully!");');
code = code.replace(/return newLead;/g, 'toast.success("Lead added successfully!");\n          return newLead;');
code = code.replace(/return newClient;/g, 'toast.success("Client added successfully!");\n          return newClient;');
code = code.replace(/setProjects\(\[newProject, \.\.\.projects\]\);/g, 'setProjects([newProject, ...projects]);\n        toast.success("Project added successfully!");');
code = code.replace(/setProjects\(\(prev\) => prev.map\(\(p\) => \(p.id == updated.id \? updatedProject : p\)\)\);/g, 'setProjects((prev) => prev.map((p) => (p.id == updated.id ? updatedProject : p)));\n        toast.success("Project updated successfully!");');
code = code.replace(/setFollowUps\(\(prev\) => \[\.\.\.prev, newFollowup\]\);/g, 'setFollowUps((prev) => [...prev, newFollowup]);\n        toast.success("Follow-up added successfully!");');
code = code.replace(/prev\.map\(\(f\) => \(f\.id == updated\.id \? updated : f\)\),\n        \);/g, 'prev.map((f) => (f.id == updated.id ? updated : f)),\n        );\n        toast.success("Follow-up updated successfully!");');
code = code.replace(/setFollowUps\(\(prev\) => prev\.filter\(\(f\) => f\.id != id\)\);/g, 'setFollowUps((prev) => prev.filter((f) => f.id != id));\n        toast.success("Follow-up deleted successfully!");');

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx updated with Toasts!');
