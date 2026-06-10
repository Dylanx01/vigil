from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

def start_scheduler():
    from services.scoring import calculer_tous_les_scores
    
    scheduler.add_job(
        calculer_tous_les_scores,
        trigger=IntervalTrigger(minutes=30),
        id="calcul_scores",
        name="Calcul scores de risque",
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler démarré — calcul toutes les 30 minutes")

def stop_scheduler():
    scheduler.shutdown()
    logger.info("Scheduler arrêté")