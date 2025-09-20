// URL encode the MongoDB password
const password = '_)(*!@#$%^Jo2030%&$^';
const encodedPassword = encodeURIComponent(password);

console.log('Original password:', password);
console.log('URL encoded password:', encodedPassword);
console.log('Full connection string:');
console.log(`mongodb+srv://gonana:${encodedPassword}@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow`);
