import { getClasses } from "./src/services/classService";
async function test() {
  const classes = await getClasses();
  console.log(JSON.stringify(classes, null, 2));
  process.exit(0);
}
test();
