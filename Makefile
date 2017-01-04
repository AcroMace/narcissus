all:
	electron-packager . Narcissus --platform=darwin --icon=img/icons/icon.icns --out=out
clean:
	rm indexedMessages.json lunrIndex.json profile.jpg; rm -rf out
run:
	electron .
