const { PrismaClient } = require('@prisma/client');
const { performance, PerformanceObserver } = require('perf_hooks');

// GC 이벤트 로거
const obs = new PerformanceObserver((list) => {
  const entry = list.getEntries()[0];
  console.log(`[GC STATS] Type: ${entry.kind}, Duration: ${entry.duration.toFixed(2)}ms`);
});
obs.observe({ entryTypes: ['gc'], buffered: true });

const prisma = new PrismaClient();

async function main() {
  console.log('[INIT] DB Connection successful.');
  await prisma.$connect();
  
  console.log("[TEST START] Starting combined 'GC -> Zombie Connection Query' loop...");
  
  setInterval(async () => {
    try {
      // 1. GC를 먼저 강제로 실행합니다.
      if (global.gc) {
        console.log(`[${new Date().toISOString()}] Forcing GC...`);
        global.gc();
      }
      
      // 2. 이후, '좀비 커넥션'일 가능성이 있는 연결로 쿼리를 실행합니다.
      console.log(`[${new Date().toISOString()}] After GC, attempting a query...`);
      const test = await prisma.test.findFirst();
      console.log(`[${new Date().toISOString()}] Query successful.`);

    } catch (e) {
      console.error(`[${new Date().toISOString()}] Query failed with error:`, e.code);
    }
  }, 15000); // 15초 간격 (DB 타임아웃 10초보다 길게)
}

main().catch(e => { console.error(e); process.exit(1); });