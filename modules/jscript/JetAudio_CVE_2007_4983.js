// jetAudio "DownloadFromMusicStore()" Arbitrary File Download Vulnerability
// CVE-2007-4983

function JetAudio() {
	this.DownloadFromMusicStore=function(url, dst, title, artist, album, genere, size, param1, param2) {
		add_alert("Downloading " + url + " and saving locally as " + dst);
	}
}