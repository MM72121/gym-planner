-- RLS Policies for gym-planner tables
-- Run these in your Supabase SQL Editor to allow anon role read/write access

-- EXERCISES TABLE
-- Allow anon role to read all exercises
CREATE POLICY "allow_anon_read_exercises" ON "public"."exercises"
  FOR SELECT
  USING (true);

-- Allow anon role to insert exercises
CREATE POLICY "allow_anon_insert_exercises" ON "public"."exercises"
  FOR INSERT
  WITH CHECK (true);

-- WORKOUTS TABLE
-- Allow anon role to read all workouts
CREATE POLICY "allow_anon_read_workouts" ON "public"."workouts"
  FOR SELECT
  USING (true);

-- Allow anon role to insert workouts
CREATE POLICY "allow_anon_insert_workouts" ON "public"."workouts"
  FOR INSERT
  WITH CHECK (true);

-- WORKOUT_SETS TABLE
-- Allow anon role to read all workout sets
CREATE POLICY "allow_anon_read_workout_sets" ON "public"."workout_sets"
  FOR SELECT
  USING (true);

-- Allow anon role to insert workout sets
CREATE POLICY "allow_anon_insert_workout_sets" ON "public"."workout_sets"
  FOR INSERT
  WITH CHECK (true);
