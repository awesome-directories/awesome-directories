CREATE POLICY "Anyone can view approved pending directories"
  ON pending_directories FOR SELECT
  USING (status = 'approved');
