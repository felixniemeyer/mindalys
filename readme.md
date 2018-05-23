# Mindalys
Analyze a series of timestamped posts. 

## Setup
Get this repo

```
git clone git@github.com:felixniemeyer/mindalys.git
cd mindalys
```

Install dependencies
```
npm install
```

Create a https self signed certificate: 
```
cd ssl-cert
openssl req \
	-config localhost.cnf \
	-new -x509 -sha256 \
	-newkey rsa:2048 \
	-nodes \
	-keyout key.pem \
	-days 365 \
	-out cert.pem
```

And run server
```
node server.js
```

This server also serves static files from ./client/dist
If you want to display analysis results as a graph and add posts from the browser, have a look at the [mindalys-client](https://github.com/felixniemeyer/mindalys-client)


# Sample

There are some scripts included, that allow you to make an analysis on a long text e.g. a book.

First split the text into many posts with a subsequent timestamps (20 lines per "day") 
```
mkdir sample-data
node tools/book-to-posts.js -b faust -f sample-text.txt -o sample-data/
```

You should have a bunch of files in your `mindalys/sample-data` folder named somthing like `2017-04-10-faust-page-99.txt`

Now make sure your server is running and execute the following script: 
```
node tools/import-posts-from-folder.js -d ./sample-data/ -u books -b faust
```

The server should log some post request and store these posts in the db for a user named `books` and a book called `faust`. 
You could now use the [client](https://github.com/felixniemeyer/mindalys-client) to find out, what words appear most often over time in that book. 

The analysis result could look like this:
![picture not in repo](https://raw.githubusercontent.com/felixniemeyer/mindalys/master/sample-output.svg)

# Bugs

For some reasons there is a bunch of labels at x = 0, y = 0.
Words, that don't have a maximum > k shouldn't be there at all. 
