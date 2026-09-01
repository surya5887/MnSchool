const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const faulty = `                {Array.from(() => {
                  const map = new Map<string, { parent?: Group, subgroups: Group[] }>();
                  groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
                  filteredGroups.filter(g => g.linkedParent).forEach(g => {
                     if (!map.has(g.linkedParent!)) map.set(g.linkedParent!, { subgroups: [] });
                     map.get(g.linkedParent!)!.subgroups.push(g);
                  });
                  return map.entries();
                })().filter(([_, comm]) => comm.subgroups.length > 0).map(([pId, comm]) => {`;

const fixed = `                {(() => {
                  const map = new Map<string, { parent?: Group, subgroups: Group[] }>();
                  groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
                  filteredGroups.filter(g => g.linkedParent).forEach(g => {
                     if (!map.has(g.linkedParent!)) map.set(g.linkedParent!, { subgroups: [] });
                     map.get(g.linkedParent!)!.subgroups.push(g);
                  });
                  return Array.from(map.entries()).filter(([_, comm]) => comm.subgroups.length > 0).map(([pId, comm]) => {`;

if (code.includes(faulty)) {
    code = code.replace(faulty, fixed);
} else {
    console.log("Could not find the exact faulty block!");
}

const faultyEnd = `                    </div>
                  )
                })}
                
                {/* Standalone Groups */}`;

const fixedEnd = `                    </div>
                  )
                })
              })()}
                
                {/* Standalone Groups */}`;

if (code.includes(faultyEnd)) {
    code = code.replace(faultyEnd, fixedEnd);
} else {
    console.log("Could not find the exact faulty end block!");
}

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("React IIFE fixed");
