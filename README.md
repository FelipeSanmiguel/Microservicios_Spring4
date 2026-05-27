La idea es que cada uno cree una carpeta con los microservicios y deje una descripción de las cosas más importantes de su implementación e instrucciones a seguir para clonarlo, y tambien explicar que bases de datos o que tipo de modificacinoes hacer para que todo funcione a la perfeccion 
# Base de datos 
sudo apt update 

# Microservicio CLiente 
sudo apt update 
clonar el repo e ir a la carpeta de microoservicio-cliente 
ahi se debe poner sudo npm install 
y luego para correr usan 
npm run dev
en el navegador se entra con : 
http://<IP_Pública>:3000/api/clientes

# Para microservicio de Factura 
Para instalar Django 
pip install django djangorestframework
Para instalar PostgresSQL
pip install psycopg2-binary requests
- toca cambiar el views.py y podner la ip publica de proyectops
- -toca cambiar settings.py para po0ner DATABASE como postgress y con la clave y contraseña que pongamos en la BD de AWS

- SE CLONA EL REPO
- sudo apt update
- sudo apt install python3-pip python3-venv -y
- python3 -m venv venv
- source venv/bin/activate
- pip install django
- pip install psycopg2-binary
- pip install requests
Se hacen las migraciones
python manage.py makemigrations
python manage.py migrate

# MONITORING 
- sudo apt update
- cloan el repo
- van a microservicio-cliente
-  sudo apt install nodejs
-  sudo apt install npm
-  npm install @aws-sdk/client-sns
-  sudo nano  monitoring.js  ( para cambiar la ip publica del micro de clientes)
  const urlDestino = 'http://localhost:3000/api/heartbeat'; // cambiar localhost por la IP o dominio del microservicio cliente
- node monitoring.js 

- Y se corre dentro del ambiente virtual
- python manage.py runserver 0.0.0.0:8000


