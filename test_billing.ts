import { runAutomatedBilling } from "./src/services/billingService";

async function run() {
  console.log("Running billing engine...");
  const count = await runAutomatedBilling();
  console.log("Generated count:", count);
  process.exit(0);
}
run();
