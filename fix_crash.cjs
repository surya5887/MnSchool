const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const faultyBlock = `{Array.from(() => {
                const map = new Map<string, { parent?: Group, subgroups: Group[] }>();
                groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
                filteredGroups.filter(g => g.linkedParent).forEach(g => {
                   if (!map.has(g.linkedParent!)) map.set(g.linkedParent!, { subgroups: [] });
                   map.get(g.linkedParent!)!.subgroups.push(g);
                });
                return map.entries();
              })().filter(([_, comm]) => comm.subgroups.length > 0).map(([pId, comm]) => {`;

const fixedBlock = `{(() => {
                const map = new Map<string, { parent?: Group, subgroups: Group[] }>();
                groups.filter(g => g.isParentCommunity).forEach(p => map.set(p.id, { parent: p, subgroups: [] }));
                filteredGroups.filter(g => g.linkedParent).forEach(g => {
                   if (!map.has(g.linkedParent!)) map.set(g.linkedParent!, { subgroups: [] });
                   map.get(g.linkedParent!)!.subgroups.push(g);
                });
                return Array.from(map.entries()).filter(([_, comm]) => comm.subgroups.length > 0).map(([pId, comm]) => {`;

code = code.replace(faultyBlock, fixedBlock);

fs.writeFileSync('src/pages/Announcements.tsx', code, 'utf8');
console.log("Fixed React crash");
