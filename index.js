const WebSocket = require('ws');
const moment = require('moment');
const axios = require('axios').default;

//Too lazy to reverse these, open chrome dev tools, click button, add your own values
axios.defaults.headers.common['cookie'] = '';
axios.defaults.headers.common['csrftoken'] = '';
axios.defaults.headers.common['device-info'] = '';
axios.defaults.headers.common['fvideo-id'] = '';
axios.defaults.headers.common['x-trace-id'] = '';
axios.defaults.headers.common['x-trace-id'] = '';
axios.defaults.headers.common['x-ui-request-trace'] = '';
axios.defaults.headers.common['bnc-uuid'] = '';



// all other headers
axios.defaults.headers.common['clienttype'] = 'web';
axios.defaults.headers.common['x-host'] = 'www.binance.com';
axios.defaults.headers.common['lang'] = 'en';
axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';
axios.defaults.headers.common['referer'] = 'https://www.binance.com/en/activity/bitcoin-button-game';
axios.defaults.headers.common['origin'] = 'https://www.binance.com';
axios.defaults.headers.common['accept-language'] = 'en-US,en;q=0.9';
axios.defaults.headers.common['accept'] = '*/*';
axios.defaults.headers.common['content-type'] = 'application/json';
axios.defaults.headers.common['sec-ch-ua'] = '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"';
axios.defaults.headers.common['sec-ch-ua-mobile'] = '?0';
axios.defaults.headers.common['sec-ch-ua-platform'] = '"Windows"';
axios.defaults.headers.common['sec-fetch-dest'] = 'empty';
axios.defaults.headers.common['sec-fetch-mode'] = 'cors';
axios.defaults.headers.common['sec-fetch-site'] = 'same-site';

const ws = new WebSocket('wss://activity-game.binance.com/stream?streams=BUTTON_CLICK');

ws.on('open', function open() {
	console.log('Connected to Binance');
});

let lastClick = 0;
let buttonClicked = false;

ws.on('message', function message(data) {
	lastClick = JSON.parse(data).data.d.pt;
});

//to see activity we check what is going on every second
setInterval(() => {
	if( lastClick !== 0 ){
		console.log(`[${moment(lastClick).valueOf()}] Last click registered ${moment(lastClick).fromNow()}`);
	}
}, 1000)

//every 100ms we check what is the time left and see if we need to click
setInterval(() => {
	if( lastClick !== 0 && moment().valueOf() > lastClick + 59500 && buttonClicked === false ){
		console.log('omg lets click that button!!!11');

		buttonClicked = true;

		axios.post('https://www.binance.com/bapi/composite/v1/friendly/growth-activity/button/click', {previousTime: lastClick}).then((response) => {
			if( response.data ){
				if( response.data.success === false ){
					console.log( 'Click failed, ', response.data.message );

					//after 0.5s release button lock
					setTimeout(() => {
						buttonClicked = false;
					}, 500);
				} else {
					console.log('Click registered. Dunno if you won but if so, send me some $$$');
				}
			}
		}).catch(e => {
			console.log('Binance said that there was an error.', e)
		})
	}
}, 100);
