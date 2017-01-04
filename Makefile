all:
	electron-packager . Narcissus --platform=darwin
clean:
	rm indexedMessages.json lunrIndex.json profile.jpg; rm -rf Narcissus-*
run:
	electron .
