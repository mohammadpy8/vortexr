let _basename = "";

export function getBasename(): string {
  return _basename;
}

export function setBasename(base: string): void {
  _basename = base.replace(/\/$/, "");
}

export function withBasename(path: string): string {
  if (!_basename) return path;
  return `${_basename}${path}`.replace(/\/\//g, "/");
}

export function stripBasename(path: string): string {
  if (!_basename) return path;
  return path.startsWith(_basename) ? path.slice(_basename.length) || "/" : path;
}
