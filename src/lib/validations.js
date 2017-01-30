export function validateEmail(email) {
    return email.includes('@');
}

export function validateProject(project) {
    return project.match(/^\s*2\d{3}\s*\/\s*\d{1,5}\s*$/);
}
