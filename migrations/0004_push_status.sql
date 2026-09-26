-- When each device was last sent a daily reminder, and whether the push service took it, for the profile page.
ALTER TABLE push_subscriptions ADD COLUMN last_sent_at INTEGER;
ALTER TABLE push_subscriptions ADD COLUMN last_result TEXT;
