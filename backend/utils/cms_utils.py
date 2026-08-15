import logging
from datetime import datetime
from typing import Any, Dict, Tuple

from backend.utils.db_utils import get_db

logger = logging.getLogger("BTY Logger")

CONTENT_DOC_ID = "site_content_main"

DEFAULT_CONTENT: Dict[str, str] = {
    "hero_badge": "BTY Fitness Training",
    "hero_title_line_1": "BETTER THAN",
    "hero_title_accent": "YESTERDAY",
    "hero_subtitle_1": "Whether your goal is to build strength, lose weight, improve your health, or simply feel more confident, we're here to support you every step of the way.",
    "hero_subtitle_2": "Our gym is a friendly and welcoming environment where people of all fitness levels can feel comfortable, encouraged, and challenged at their own pace.",
    "hero_subtitle_3": "With personalized training, expert guidance, and a community that genuinely wants to see you succeed, you'll have the support you need to reach your goals and enjoy the journey along the way.",
    "hero_subtitle_4": "Your fitness journey starts here. Let's be Better Than Yesterday.",
    "hero_primary_cta_label": "Book Free Consultation",
    "hero_secondary_cta_label": "Explore Programs",
    "hero_sidebar_status": "Accepting New Clients",
    "hero_sidebar_title": "1-on-1 & Hybrid Coaching",
    "hero_sidebar_text": "Direct biomechanics assessment & custom fitness planning.",
    "about_title": "Meet Madison Spear",
    "about_paragraph_1": "I have been a trainer for seven years (2026) and have owned Better than Yesterday Fitness for five! I'm passionate about helping people gain the knowledge and skills to become stronger and healthier through personalized fitness coaching. I have always enjoyed working out and coaching. I was a collegiate Track & Field athelete before coaching in the sport while receiving my masters degree. I knew helping and educating people on wellness was what I wanted to do!",
    "about_paragraph_2": "I am focused on helping people imporove their overall wellness at a pace that's right for them. Helping clients reach their goals through exercise tailored to their individual circumstances is my priority. I work with a wide variety of clients from those who's goals are to lose weight, gain strength and prevent injury, to those who have chronic diseases like diabetes, cardiovascular issues, cancer, and amputations.",
    "about_paragraph_3": "Fitness is more than just lifting weights; it is about building a sustainable lifestyle, developing mental resilience, and committing to being Better Than Yesterday.",
    "about_cta_story_label": "Learn My Story",
    "about_cta_credentials_label": "View Credentials",
    "programs_kicker": "Services",
    "programs_title": "TRAINING PROGRAMS",
    "programs_subtitle": "Select a program tailored to your fitness goals and lifestyle.",
    "program_card_1_title": "1-on-1 Private Coaching",
    "program_card_1_description": "High-intensity strength & conditioning tailored directly to your biomechanics and personal targets.",
    "program_card_2_title": "Duo Session Coaching",
    "program_card_2_description": "Accountability, and cooperation based strength training personalized to your team.",
    "program_card_3_title": "Online Hybrid Fitness",
    "program_card_3_description": "Custom training plans, weekly video form audits, and direct message check-ins via our client portal.",
    "program_feature_badge": "In Action",
    "program_feature_title_line_1": "REAL RESULTS",
    "program_feature_title_line_2": "NO GUESSWORK",
    "program_feature_description": "Every program is backed by biomechanical form analysis and personalized feedback loops",
    "program_feature_cta_label": "Schedule Free Assessment",
    "book_kicker": "Free Scheduler",
    "book_title": "BOOK YOUR SESSION",
    "book_subtitle": "Pick a service, choose an available time from Madison's weekly schedule, and send your request.",
    "book_step_1_kicker": "Step 1",
    "book_step_1_title": "Choose your session",
    "book_session_consultation_title": "Free Fitness Consultation",
    "book_session_consultation_duration": "30 min",
    "book_session_consultation_description": "Goals review, movement overview, and next-step planning.",
    "book_session_1on1_title": "1-on-1 Personal Training",
    "book_session_1on1_duration": "60 min",
    "book_session_1on1_description": "Private in-person strength and biomechanics session.",
    "book_session_online_title": "Online Coaching Intake",
    "book_session_online_duration": "45 min",
    "book_session_online_description": "Virtual check-in to set up your coaching plan.",
    "book_step_2_kicker": "Step 2",
    "book_step_2_title": "Choose an available day",
    "book_loading_slots_text": "Loading Madison's recurring schedule...",
    "book_no_slots_text": "No open slots found. Madison can open more recurring blocks in the admin schedule.",
    "book_open_slots_suffix": "open slots",
    "book_step_3_kicker": "Step 3",
    "book_step_3_title": "Send booking request",
    "book_summary_prefix": "Selected:",
    "book_summary_joiner": "on",
    "book_summary_at": "at",
    "book_summary_no_time": "No time selected yet.",
    "book_label_name": "Full Name *",
    "book_label_email": "Email Address *",
    "book_label_phone": "Phone Number",
    "book_label_notes": "Goals / Notes",
    "book_notes_placeholder": "Tell Madison briefly about your current routine, injuries, or goals...",
    "book_submit_loading": "Sending Request...",
    "book_submit_label": "Confirm Booking Request",
    "book_success_kicker": "Request Sent",
    "book_success_title": "We Got It",
    "book_success_intro": "Thank you",
    "book_success_outro": "has been sent.",
    "book_success_button_label": "Book Another Session",
    "programs_page_kicker": "Transformational Pathways",
    "programs_page_title": "CHOOSE YOUR PROGRAM",
    "programs_page_subtitle": "Every body moves differently. Select a training architecture built specifically around your lifestyle, schedule, and biomechanical needs.",
    "programs_page_popular_badge": "Most Popular",
    "programs_page_card_1_badge": "In-Person",
    "programs_page_card_1_title": "1-on-1 Private Coaching",
    "programs_page_card_1_tagline": "Maximum accountability & real-time form correction.",
    "programs_page_card_1_description": "High-intensity strength & conditioning tailored directly to your unique biomechanics, movement patterns, and specific physical targets.",
    "programs_page_card_1_features": "Full body biomechanical screening\nDedicated 60-minute private sessions\nReal-time posture & joint angle tracking\nProgress tracking with clear weekly milestones\nDirect 24/7 client portal chat access\nCome 1x, 2x or 3x per week for maximum results",
    "programs_page_card_1_cta_label": "Select 1-on-1 Program",
    "programs_page_card_2_badge": "Semi-Private",
    "programs_page_card_2_title": "Duo Partner Coaching",
    "programs_page_card_2_tagline": "Shared energy, individual focus & joint accountability.",
    "programs_page_card_2_description": "Train alongside a friend, partner, or teammate while receiving customized exercise modifications for both of your fitness levels.",
    "programs_page_card_2_features": "Joint movement screening & goal alignment\nDedicated 60-minute partner sessions\nIndividualized exercise scaling & load management\nShared accountability and team motivation\nDirect 24/7 client portal chat access\nFlexible 1x, 2x, or 3x per week partner scheduling",
    "programs_page_card_2_cta_label": "Select Duo Program",
    "programs_page_card_3_badge": "Most Flexible",
    "programs_page_card_3_title": "Online Hybrid Fitness",
    "programs_page_card_3_tagline": "Train anywhere with elite guidance in your pocket.",
    "programs_page_card_3_description": "Custom training programming updated weekly, paired with video form audits and direct check-ins via our dedicated client portal.",
    "programs_page_card_3_features": "Custom app-based workout structure\nWeekly video form review & critiques\nProgressive overload tracking\nWeekly scheduled check-in calls\nFlexible workout schedule adaptation",
    "programs_page_card_3_cta_label": "Select Online Program",
    "consultation_kicker": "Start Your Journey",
    "consultation_title": "BOOK A FREE CONSULTATION",
    "consultation_subtitle": "Let's discuss your current fitness baseline, review past injuries or mechanics, and map out a tailored strategy to reach your goals.",
    "consultation_what_next_title": "What Happens Next?",
    "consultation_step_1_title": "1. Movement Screening",
    "consultation_step_1_description": "We review joint mobility, past injury history, and daily postural habits.",
    "consultation_step_2_title": "2. Goal Blueprinting",
    "consultation_step_2_description": "Define concrete targets for muscle building, fat loss, athletic power, or mobility.",
    "consultation_step_3_title": "3. Custom Plan Roadmap",
    "consultation_step_3_description": "Get recommended program structures and training cadence tailored for you.",
    "consultation_quote_text": "Training isn't about pushing past bad biomechanics - it's about teaching your body how to produce power efficiently without injury.",
    "consultation_quote_author": "- Madison Spear, Head Coach",
    "consultation_local_kicker": "Personal Training in Des Moines, IA",
    "consultation_local_intro": "BTY Fitness provides personalized strength coaching and fitness consultations for clients throughout Des Moines, Urbandale, West Des Moines, and the greater Iowa metro area. Based at Trainer's Edge Gym, Madison helps clients improve movement quality, build strength, and train with sustainable structure.",
    "consultation_local_location_title": "Location",
    "consultation_local_location_name": "Trainer's Edge Gym",
    "consultation_local_location_address": "3845 100th St, Urbandale, IA 50322",
    "consultation_local_service_title": "Service Area",
    "consultation_local_service_areas": "Des Moines • Urbandale • West Des Moines • Ankeny",
    "consultation_form_title": "Start Your Journey",
    "consultation_form_subtitle": "Book your free consultation today.",
    "consultation_form_label_name": "Full Name",
    "consultation_form_placeholder_name": "Alex Johnson",
    "consultation_form_label_email": "Email Address",
    "consultation_form_placeholder_email": "alex@example.com",
    "consultation_form_label_program": "Selected Interest / Program",
    "consultation_form_option_1": "1-on-1 Private Coaching",
    "consultation_form_option_2": "Online Hybrid Fitness",
    "consultation_form_option_3": "General Consultation",
    "consultation_form_default_program": "1-on-1 Private Coaching",
    "consultation_form_label_goals": "Primary Fitness Goals",
    "consultation_form_placeholder_goals": "Tell us about your fitness goals or injury history...",
    "consultation_form_submit_label": "Submit Request",
    "consultation_form_success_alert": "Thank you! Madison will be in touch shortly.",
    "consultation_form_error_alert": "Submission failed. Please try again.",
    "consultation_form_network_alert": "Unable to reach the server. Please check your connection.",
    "about_page_kicker": "About Madison",
    "about_page_title": "Strength coaching built for real life and lasting change.",
    "about_page_subtitle": "BTY is less about chasing a perfect body and more about learning how to train with intention. Every plan is built around biomechanics, recovery, and momentum you can keep.",
    "about_page_section_title": "Why I coach this way",
    "about_page_paragraph_1": "Most people do not fail because they lack effort. They fail because their plan is generic, exhausting, or disconnected from their actual lifestyle. My coaching system is designed to fix that.",
    "about_page_paragraph_2": "We start by understanding your movement quality, injury history, schedule, and stress load. Then we build a structure that meets you where you are and grows with you.",
    "about_page_cta_qualifications": "View Qualifications",
    "about_page_cta_testimonials": "Read Testimonials",
    "about_page_pillar_1_title": "Precision",
    "about_page_pillar_1_text": "Technique-first coaching that protects joints and improves power output over time.",
    "about_page_pillar_2_title": "Consistency",
    "about_page_pillar_2_text": "Programming designed to survive busy weeks, travel, and the realities of daily life.",
    "about_page_pillar_3_title": "Ownership",
    "about_page_pillar_3_text": "Clients learn the why behind each decision so progress continues beyond each session.",
    "qualifications_kicker": "Qualifications",
    "qualifications_title": "Built on education, sharpened by real client outcomes.",
    "qualifications_subtitle": "Every recommendation in BTY coaching is rooted in formal movement science - backed by an M.S.E. in Exercise Science, a B.A. in Human Performance, and practical coaching experience.",
    "qualifications_item_1_title": "M.S.E. in Exercise Science",
    "qualifications_item_1_detail": "Advanced academic grounding in biomechanics, physiological adaptation, and performance optimization.",
    "qualifications_item_1_year": "Masters",
    "qualifications_item_2_title": "B.A. in Human Performance",
    "qualifications_item_2_detail": "Comprehensive foundation in motor learning, functional anatomy, and structured athletic development.",
    "qualifications_item_2_year": "Bachelors",
    "qualifications_item_3_title": "First Aid & CPR Certified",
    "qualifications_item_3_detail": "Fully certified in emergency safety protocols, ensuring a secure and reliable training environment.",
    "qualifications_item_3_year": "Certified",
    "qualifications_item_4_title": "Coaching & Programming Methodology",
    "qualifications_item_4_detail": "Focused on progressive, individualized plans that adapt to your goals and lifestyle.",
    "qualifications_item_4_year": "Applied",
    "qualifications_item_5_title": "Accountability & Client Support Systems",
    "qualifications_item_5_detail": "Structured check-ins, progress reviews, and coaching adjustments that keep momentum high.",
    "qualifications_item_5_year": "Integrated",
    "qualifications_method_title": "How that shows up in your program",
    "qualifications_highlight_1": "Movement assessments and individualized training strategy",
    "qualifications_highlight_2": "Programming built around real life, recovery, and consistency",
    "qualifications_highlight_3": "Supportive coaching that balances performance with sustainability",
    "qualifications_cta_back": "Back to About",
    "qualifications_cta_book": "Book a Consultation",
    "testimonials_kicker": "Testimonials",
    "testimonials_title": "What clients are saying.",
    "testimonials_subtitle": "Real stories, thoughtful coaching, and steady progress are the foundation of every BTY experience.",
    "testimonials_item_1_quote": "Madison helped me not just transform my body, but my life as well. Without her coaching I wouldn't be the same person I am today.",
    "testimonials_item_1_name": "Jack H.",
    "testimonials_item_1_role": "Performance Client",
    "testimonials_item_2_quote": "Getting back into shape felt overwhelming. But thanks to BTY and my amazing trainer Madison, I'm not just back on track, I'm thriving!. My personalized workouts were always accessible, whether I was at the gym or squeezing in a quick session at home. Plus, the video demonstrations were fantastic - no more wondering if I was doing the exercises correctly. Madison is a constant source of encouragement and knowledge. She even gave me suggestions to help with nutrition. And the best part? She listened to my physical limitations and created a plan that worked for me. Honestly without BTY, I'd probably still be on the couch, beating myself up. BTY jump started my fitness journey, and now exercise is a regular part of my life. I feel stronger, more confident, and incredibly grateful to Madison and BTY.",
    "testimonials_item_2_name": "Jane N.",
    "testimonials_item_2_role": "Hybrid Coaching Client",
    "testimonials_item_3_quote": "I'm a middle-aged active woman who had been intimidated by free weight training but knew how essential it is for overall health. Madison creates fun, safe, and challenging workouts to help me achieve my fitness goals.",
    "testimonials_item_3_name": "Amy R.",
    "testimonials_item_3_role": "Hybrid Coaching Client",
    "testimonials_item_4_quote": "I've been training with Madison for over 5 years. I was one of her first clients. I had just had a total knee replacement and was concerned about training. Madison did research and learned about proper exercises for my situation. It was important to me that she listened to my concerns and took the time to learn. I've found her to continue to design my training to my particular needs. All of this and she is a lot of fun.",
    "testimonials_item_4_name": "Bruce",
    "testimonials_item_4_role": "Performance Client",
    "testimonials_cta_title": "Ready to start your own story?",
    "testimonials_cta_subtitle": "Book a free consult and let's map out a plan that fits your goals.",
    "testimonials_cta_button": "Book a Consultation",
    "merch_coming_soon_text": "COMING SOON",
    "merch_kicker": "Official Equipment & Apparel",
    "merch_title": "BTY ATHLETIC GEAR",
    "merch_subtitle": "Wear the mindset. Premium training apparel and biomechanically tested gear designed to endure your toughest sessions.",
    "merch_size_label": "Size",
    "merch_buy_button_label": "Pay via Venmo",
    "merch_product_1_name": "BTY Oversized Heavyweight Hoodie",
    "merch_product_1_category": "Apparel",
    "merch_product_1_price": "$65.00",
    "merch_product_1_description": "380GSM ultra-soft fleece hoodie featuring custom high-density silicone BTY logo print on chest.",
    "merch_product_2_name": "Better Than Yesterday Logo T-Shirt",
    "merch_product_2_category": "Apparel",
    "merch_product_2_price": "$38.00",
    "merch_product_2_description": "100% combed ring-spun cotton drop-shoulder tee engineered for freedom of movement during heavy lifts."
}

ALLOWED_CONTENT_KEYS = set(DEFAULT_CONTENT.keys())

def _now_iso() -> str:
    return datetime.utcnow().isoformat()

def _sanitize_value(value: str) -> str:
    if not isinstance(value, str):
        raise ValueError("Content value must be a string.")
    cleaned = value.strip()
    if len(cleaned) > 2000:
        raise ValueError("Content value exceeds 2000 characters.")
    return cleaned

def _base_doc() -> Dict[str, Any]:
    return {
        "_id": CONTENT_DOC_ID,
        "items": dict(DEFAULT_CONTENT),
        "updated_at": _now_iso(),
        "updated_by": None,
    }

def _merge_with_defaults(items: Dict[str, Any] | None) -> Dict[str, str]:
    merged = dict(DEFAULT_CONTENT)
    if isinstance(items, dict):
        for key, value in items.items():
            if key in ALLOWED_CONTENT_KEYS and isinstance(value, str):
                cleaned = value.strip()
                if cleaned:
                    merged[key] = cleaned
    return merged

def get_content_map() -> Dict[str, Any]:
    db = get_db()
    if db is None:
        logger.info("get_content_map returning defaults because DB is disabled")
        return {
            "items": dict(DEFAULT_CONTENT),
            "defaults": dict(DEFAULT_CONTENT),
            "updated_at": _now_iso(),
        }

    collection = db["site_content"]
    doc = collection.find_one({"_id": CONTENT_DOC_ID})
    if not doc:
        doc = _base_doc()
        collection.replace_one({"_id": CONTENT_DOC_ID}, doc, upsert=True)
        logger.info("Created default site content document")

    return {
        "items": _merge_with_defaults(doc.get("items")),
        "defaults": dict(DEFAULT_CONTENT),
        "updated_at": doc.get("updated_at") or _now_iso(),
    }

def update_content_key(key: str, value: str, updated_by: str | None = None) -> Dict[str, Any]:
    if key not in ALLOWED_CONTENT_KEYS:
        raise ValueError(f"Invalid content key: {key}")

    cleaned_value = _sanitize_value(value)
    db = get_db()
    now = _now_iso()

    if db is None:
        logger.info("update_content_key called without DB; returning simulated update")
        return {
            "key": key,
            "value": cleaned_value,
            "updated_at": now,
        }

    collection = db["site_content"]
    current = collection.find_one({"_id": CONTENT_DOC_ID}) or _base_doc()
    items = _merge_with_defaults(current.get("items"))
    items[key] = cleaned_value

    payload = {
        "_id": CONTENT_DOC_ID,
        "items": items,
        "updated_at": now,
        "updated_by": updated_by,
    }
    collection.replace_one({"_id": CONTENT_DOC_ID}, payload, upsert=True)

    return {
        "key": key,
        "value": cleaned_value,
        "updated_at": now,
    }

def update_content_bulk(items: Dict[str, str], updated_by: str | None = None) -> Tuple[int, str]:
    if not isinstance(items, dict):
        raise ValueError("items must be an object map.")

    updates: Dict[str, str] = {}
    for key, value in items.items():
        if key not in ALLOWED_CONTENT_KEYS:
            raise ValueError(f"Invalid content key: {key}")
        updates[key] = _sanitize_value(value)

    db = get_db()
    now = _now_iso()

    if db is None:
        logger.info("update_content_bulk called without DB; returning simulated update")
        return len(updates), now

    collection = db["site_content"]
    current = collection.find_one({"_id": CONTENT_DOC_ID}) or _base_doc()
    merged = _merge_with_defaults(current.get("items"))
    merged.update(updates)

    payload = {
        "_id": CONTENT_DOC_ID,
        "items": merged,
        "updated_at": now,
        "updated_by": updated_by,
    }
    collection.replace_one({"_id": CONTENT_DOC_ID}, payload, upsert=True)

    return len(updates), now