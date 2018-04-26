export function parseName(strName: string): {scope: string, name: string} {
  let scope = '';
  let name = strName
  if (/^@.*\/.*/.test(name)) {
    [scope, name] = name.split('/');
    scope = scope.replace(/^@/, '');
  }
  return {
    scope,
    name
  }
}
