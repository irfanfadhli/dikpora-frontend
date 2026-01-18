const id = '0f701431-36d0-4ddd-8779-23512bfdcfbb';
const url = `https://api-pemda.vercel.app/v1/rooms/${id}`;
fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log('Single Structure:', Object.keys(data));
        if (data.data) {
            console.log('single data property keys:', Object.keys(data.data));
        }
        console.log('Single Sample:', JSON.stringify(data));
    })
    .catch(err => console.error(err));
