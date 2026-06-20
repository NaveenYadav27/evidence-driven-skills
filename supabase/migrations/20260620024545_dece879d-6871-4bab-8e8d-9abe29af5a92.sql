
-- user_assessments: restrict writable columns
REVOKE INSERT, UPDATE ON public.user_assessments FROM authenticated;
GRANT INSERT (user_id, assessment_id, module_id, answers, current_question, remaining_time_sec)
  ON public.user_assessments TO authenticated;
GRANT UPDATE (answers, current_question, remaining_time_sec, updated_at)
  ON public.user_assessments TO authenticated;

-- user_labs: restrict writable columns (score/status/flags privileged)
REVOKE INSERT, UPDATE ON public.user_labs FROM authenticated;
GRANT INSERT (user_id, lab_id, module_id, current_step, completed_steps, objectives, commands, notes, time_spent_ms)
  ON public.user_labs TO authenticated;
GRANT UPDATE (current_step, completed_steps, objectives, commands, notes, time_spent_ms, updated_at)
  ON public.user_labs TO authenticated;
