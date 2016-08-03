# korpu
Proxy hecho en vox-core altamente configurable y extendible.

Para usar korpu primero instale [vox-core](https://www.npmjs.com/package/vox-core).

Luego utilice la línea de comandos de vox-core para instalar korpu: 
*NOTA*: En windows debe ejecutar los comandos desde una ventana cmd con permisos de administrador


**Unix (linux,osx):**

```bash
> sudo npm install -g vox-core
> sudo vox -install -g korpu
> korpu 
```


**Windows:**

```bash
> npm install -g vox-core
> vox -install -g korpu
> korpu 
```

### Limitaciones

Por ahora use *korpu* con precaución. Actualmente solo soporta protocolo no seguro http. No soporta tampoco *websockets*


### Archivo de configuración de Korpu

Korpu puede extenderse fácilmente, por medio de su archivo de configuración que se encuentra en la siguiente ubicación:

Unix:
```bash
~/.korpu/config.es6
```

Windows:
```batch
%USERPROFILE%\.korpu\config.es6
```

El archivo inicial tiene una estructura como esta: 

```javascript
export default {
    "port": 1200,
    "timeout": 560000,
    "console": "default",
    "autoresponder": [
    ]
}
```

**port**: Define el puerto en el que se va a ejecutar el proxy. Por defecto es el 1200. No se recomienda abrir **korpu** como **root** en sistemas Unix. Si necesita ejecutar el proxy en el puerto **80** utilice un programa como **Nginx** para realizar un reverse proxy

**timeout**: Es el tiempo de espera en milisegundos para realizar una conexión

**console**: Por ahora ignore este parámetro. Esta pensado para definir un log. Por ahora el log se hace a la consola

**autoresponder**: Aquí es donde se configurará extensiones que manejen urls. En otras palabras cuando llega una solicitud al programa, este analiza si está configurado un *AutoResponder* que pueda manejar la url solicitada. A continuación veremos como crear un *AutoResponder*


### Extensiones para korpu

Vamos a trabajar en extensiones para *Korpu* las cuales vamos a ir subiendo a npm con el prefijo *korpu-* 

Por ahora las extensiones son *AutoResponders* es decir manejan *urls*. 
Para ello debemos colocarlas en el archivo de configuración de *korpu*

Considere el siguiente ejemplo: 

```javascript
export default {
    "port": 1200,
    "timeout": 560000,
    "console": "default",
    "autoresponder": [

        // Esta parte es la que configura el AutoResponder
        {
            "match": /http:\/\/myurl.com\/\S*/i,
            "active": true,
            "id": "org.mycompany.myrul",
            "code": "export default function(ev){ev.request.response.write('Hello world');ev.request.response.end();}"
        }
    ]
}
```

Analicemos la parte que nos interesa. Para configurar un autoresponder debemos colocar en la configuración un objeto con las siguientes propiedades:


**match**: Expresión regular para probar las url que sean solicitadas al proxy

**active**: Indica si el AutoResponder está activo o no

**id**: Esto es importante, cada *AutoResponder* debe tener un id único, por loque se sugiere se componga de un prefijo como *org* o *com* luego del nombre de su compañía y el nombre del producto. 

**code**: (Opcional) Es código de *EcmaScript 6*. Debe exportar como default una función encargada de manejar la solicitud. En *Javascript* normal, o *EcmaScript 5* el código del ejemplo sería equivalente a colocar:

```bash
exports.default= function(ev){
    ev.request.response.write('Hello world');
    ev.request.response.end();
}
```

**require** (Opcional) Este parámetro es para indicar que se debe cargar el *AutoResponder* desde un archivo, y no desde código fuente. Si no se especifica *code* debe especificar este parámetro. 

Suponiendo que usted tenga un archivo */path/to/file.es6* que contenga esto:

```javascript
export default function(ev){
    ev.request.response.write('Hello world');
    ev.request.response.end();
}
```

Entonces el siguiente archivo de configuración funcionaría exactamente igual que el anterior:

```javascript
export default {
    "port": 1200,
    "timeout": 560000,
    "console": "default",
    "autoresponder": [

        // Esta parte es la que configura el AutoResponder
        {
            "match": /http:\/\/myurl.com\/\S*/i,
            "active": true,
            "id": "org.mycompany.myrul",
            "require": "/path/to/file.es6"
        }
    ]
}
```

¿Pero que parámetros recibe la función que exportamos en nuestro archivo o código de configuración del *AutoResponder*?

A continuación analizamos eso: 

#### Parámetros de la función *handler* del AutoResponder

La función recibe un solo parámetro. Este parámetro es un objeto que contiene las siguientes propiedades:

*proxy*: Es una referencia al objeto *Proxy*. Para saber como funciona este objeto revise el archivo *src/Proxy.es6*

*request*: Es una referencia al objeto *RequestArgs*. Para saber como funciona este objeto revise el archivo *submodules/vox-core-http/src/VW/Http/RequestArgs.js* del proyecto vox-core. Sin embargo para que tenga una idea, este objeto posee dos propiedades principalmente:

1. *request*: Es el objeto *request* nativo de NodeJs que recibe la solicitud web
2. *response*: Es el objeto *request* nativo de NodeJs encargado de enviar la respuesta al cliente. 

### License

[Creative Commons Attribution-ShareAlike 4.0 International](/LICENSE)




