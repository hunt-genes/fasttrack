export function validateEmail(email) {
    return email.includes('@');
}

export function validateProject(project) {
    return project.match(/^\s*\d{4}\s*\/\s*\d{1,6}\s*$/);
}
