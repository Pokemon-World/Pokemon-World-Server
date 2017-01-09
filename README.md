- Pokémon World Online - Server Basic Setup 

Welcome to our README.md ~ Note that currently most usernames are free without a password, Only less than 50 accounts have been registered.

This guide will help you on setting up you're very own pokemon world online server.

................................................................................................
Requirements: 'Node.js command prompt' ~ https://nodejs.org/en/ ~ Download for Windows (x86) Latest-Version: 6.9.2 Supported: 5.7.0 at the least.

( Step-1 ) your computers folder path

> cd C:\Users\%Username%\Downloads\pokemon-world-server-master\pokemon-world-server (default path)

( Step-2 ) Press Win + R (Win: 4 Flags Key Between Ctrl + Alt) and type cmd.exe in the Run Box
> cd current_server_path (From Step-1)

> npm install --server

( Step-3 ) Starting up your server on your end (localhost.psim.online) for local testing, Just search "what is my IP" for global IP.

> node app.js OR node app (.js extention is optional)

Let's help you open a port so you're freinds can join you're server heres an easy to help instruction below!

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
README GUIDE: http://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/
YOUTUBE GUIDE: https://www.youtube.com/results?search_query=how-to-forward-ports-on-your-router
PORT-CHECK See if the ports 'open' or 'closed' : http://www.yougetsignal.com/tools/open-ports/ - Can also get IP here.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Great. After doing the above processes... You want to become owner right follow steps below

Open your server files, go to config, add a file called usergroups.csv, Add in the file ``YOURNAME,~`` to grant you admin.

Once done save the file and restart the server, Job done you can now run a server with us.
