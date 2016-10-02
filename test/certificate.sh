#!/usr/bin/bash


## Crear Entidad de Certificación:
export name="rootCA"
openssl genrsa -des3 -out $name.key 2048
openssl req -x509 -new -nodes -key $name.key -sha256 -days 1024 -out $name.pem


# crear certificado
export cert="device"
openssl genrsa -out $cert.key 2048
openssl req -new -key $cert.key -out $cert.csr
openssl x509 -req -in $cert.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out $cert.crt -days 500 -sha256



# Instalar el certificado de la autoridad de certificación en linux ...

# EN UBUNTU DEBE INSTALAR:
sudo apt-get install libnss3-tools


export entidad="rootCA"
certutil -d sql:$HOME/.pki/nssdb -A -t "TC" -n "$entidad" -i '$FILE'


# !LISTO ....
# También se puede añadir a CA Certificates ...
sudo cp $FILE '/usr/local/share/ca-certificates/$entidad.crt' 
sudo update-ca-certificates