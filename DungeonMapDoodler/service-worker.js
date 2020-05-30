var cacheName = 'cache-v1';
var resourcesToPrecache = [
	'/',
	'index.html',
	'doodle.png',
	'door_left_right.png',
	'door_up_down.png',
	'erase.png',
	'hatching.png',
	'hatch.jpg',
	'hatch.png',
	'icon-192.png',
	'images',
	'index.html',
	'irutil.js',
	'keyedarray.js',
	'line.png',
	'manifest.json',
	'modes.js',
	'move.png',
	'roomtool.png',
	'service-worker.js',
	'shapetool.png',
	'smoothpopup.js',
	'snaptogrid.png',
	'stairs_down.png',
	'stairs_left.png',
	'stairs_right.png',
	'stairs_up.png',
	'stamp.png',
	'star.png',
	'style.css',
	'images/circlefuzz.png',
	'images/move.svg',
	'images/squarefuzz.png'
]



self.addEventListener('install', event => {
	console.log('Install!');
	/*try{
		event.waitUntil(
			caches.open(cacheName)
			.then(cache => {
				return cache.addAll(resourcesToPrecache)
			})
		);
	}catch(e){console.log(e)};*/
});
self.addEventListener("activate", event => {
  console.log('Activate!');
});
self.addEventListener('fetch', function(event) {
  console.log('Fetch!', event.request);
});