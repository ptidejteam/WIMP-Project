---
sidebar_position: 2
---

# Backend Exposition

This page will describe how to expose the Backend part of the WIMP system so that it can be accessed by the teachers and the administrators.

:::info
As a reminder, the "Backend" term in the WIMP system refers to the part that is accessible to teachers and administrators. For more information about the definitions used in the WIMP system, please see [this page](../intro.md).
:::

:::note
For this part of the tutorial, you must be in the `ExpressNodeRed` directory :
```bash
cd ~/wimp-backend/ExpressNodeRed/
```
:::

## Create a Backend service
You can create a systemd service for the Backend part :
-  Copy the file `conf/wimp-backend.service` into the systemd directory :
```bash
cp conf/wimp-backend.service /etc/systemd/system/
```
- Start the Backend service :
```bash
sudo systemctl start wimp-backend.service
```
Here, the Backend part of the WIMP system is running on the Port that you have defined in the `.env` file.

- Verify that the service has started correctly : 
```bash
sudo systemctl status wimp-backend.service
```

## Generate SSL certificate

In order to make the frontend work with HTTPS, you can generate a self-signed SSL certificate. To generate a self-signed certificate, you need to follow the following steps:
1. Create your own Certification Authority (CA)
    - Install openssl on the server:
    ```bash
    sudo apt-get install openssl
    ```
    - Create a directory to store the certificates:
    ```bash
    sudo mkdir /etc/ssl/wimp
    ```
    - Create the following configuration file for your CA:
    ```bash
    vim openssl-ca.cnf

        HOME            = .
    RANDFILE        = $ENV::HOME/.rnd

    ####################################################################
    [ ca ]
    default_ca    = CA_default      # The default ca section

    [ CA_default ]

    default_days     = 365          # How long to certify for
    default_crl_days = 30           # How long before next CRL
    default_md       = sha256       # Use public key default MD
    preserve         = no           # Keep passed DN ordering

    x509_extensions = ca_extensions # The extensions to add to the cert

    email_in_dn     = no            # Don't concat the email in the DN
    copy_extensions = copy          # Required to copy SANs from CSR to cert

    ####################################################################
    [ req ]
    default_bits       = 4096
    default_keyfile    = cakey.pem
    distinguished_name = ca_distinguished_name
    x509_extensions    = ca_extensions
    string_mask        = utf8only

    ####################################################################
    [ ca_distinguished_name ]
    countryName         = Country Name (2 letter code)
    countryName_default = US

    stateOrProvinceName         = State or Province Name (full name)
    stateOrProvinceName_default = Maryland

    localityName                = Locality Name (eg, city)
    localityName_default        = Baltimore

    organizationName            = Organization Name (eg, company)
    organizationName_default    = Test CA, Limited

    organizationalUnitName         = Organizational Unit (eg, division)
    organizationalUnitName_default = Server Research Department

    commonName         = Common Name (e.g. server FQDN or YOUR name)
    commonName_default = Test CA

    emailAddress         = Email Address
    emailAddress_default = test@example.com

    ####################################################################
    [ ca_extensions ]

    subjectKeyIdentifier   = hash
    authorityKeyIdentifier = keyid:always, issuer
    basicConstraints       = critical, CA:true
    keyUsage               = keyCertSign, cRLSign
    ```

    - Generate the CA:
    ```bash
    openssl req -x509 -config openssl-ca.cnf -newkey rsa:4096 -sha256 -nodes -out cacert.pem -outform PEM
    ```

    - You can inspect the content of the CA generated:
    ```bash
    openssl x509 -in cacert.pem -text -noout
    ```

2. Create a certificate signing request (CSR) for the server that hosts the frontend
    - Create the configuration file for the generation of the CSR:
    ```bash
    vim openssl-server.cnf

    HOME            = .
    RANDFILE        = $ENV::HOME/.rnd

    ####################################################################
    [ req ]
    default_bits       = 2048
    default_keyfile    = serverkey.pem
    distinguished_name = server_distinguished_name
    req_extensions     = server_req_extensions
    string_mask        = utf8only

    ####################################################################
    [ server_distinguished_name ]
    countryName         = Country Name (2 letter code)
    countryName_default = US

    stateOrProvinceName         = State or Province Name (full name)
    stateOrProvinceName_default = MD

    localityName         = Locality Name (eg, city)
    localityName_default = Baltimore

    organizationName            = Organization Name (eg, company)
    organizationName_default    = Test Server, Limited

    commonName           = Common Name (e.g. server FQDN or YOUR name)
    commonName_default   = Test Server

    emailAddress         = Email Address
    emailAddress_default = test@example.com

    ####################################################################
    [ server_req_extensions ]

    subjectKeyIdentifier = hash
    basicConstraints     = CA:FALSE
    keyUsage             = digitalSignature, keyEncipherment
    subjectAltName       = @alternate_names
    nsComment            = "OpenSSL Generated Certificate"

    ####################################################################
    [ alternate_names ]

    DNS.1  = example.com
    DNS.2  = www.example.com
    DNS.3  = mail.example.com
    DNS.4  = ftp.example.com

    # If you don't have a DNS name in production, you have to put the IP of your
    # server that the browser can reach.

    # Add these if you need them. But usually you don't want them or
    #   need them in production. You may need them for development.
    # DNS.5       = localhost
    # DNS.6       = localhost.localdomain
    # IP.1        = 127.0.0.1
    # IP.2        = ::1
    ```
    
    - Generate the CSR:
    ```bash
    openssl req -config openssl-server.cnf -newkey rsa:2048 -sha256 -nodes -out servercert.csr -outform PEM
    ```

    - You can inspected the content of the CSR generated:
    ```bash
    openssl req -text -noout -verify -in servercert.csr
    ```

3. Sign the server's CSR with your CA key
    - Update the CA's configuration file with the following changes:
        - Add the two following sections at the end of the configuration file:
        ```bash
        ####################################################################
        [ signing_policy ]
        countryName            = optional
        stateOrProvinceName    = optional
        localityName           = optional
        organizationName       = optional
        organizationalUnitName = optional
        commonName             = supplied
        emailAddress           = optional

        ####################################################################
        [ signing_req ]
        subjectKeyIdentifier   = hash
        authorityKeyIdentifier = keyid,issuer
        basicConstraints       = CA:FALSE
        keyUsage               = digitalSignature, keyEncipherment
        ```

        - Add the following information to the `[CA-default]` section:
        ```bash
        base_dir      = .
        certificate   = $base_dir/cacert.pem   # The CA certifcate
        private_key   = $base_dir/cakey.pem    # The CA private key
        new_certs_dir = $base_dir              # Location for new certs after signing
        database      = $base_dir/index.txt    # Database index file
        serial        = $base_dir/serial.txt   # The current serial number

        unique_subject = no  # Set to 'no' to allow creation of
                            # several certificates with same subject.
        ```
    - Create the files index.txt and serial.txt :
    ```bash
    touch index.txt
    echo '01' > serial.txt
    ```

    - Sign the CSR with your CA : 
    ```bash
    openssl ca -config openssl-ca.cnf -policy signing_policy -extensions signing_req -out servercert.pem -infiles servercert.csr
    ```

4. Install the CA certificate on the client (users' browser)
    - Import the file `cacert.pem` as an Authority in your users' browser

:::note
The information mentionned in this part are extracted from the following resources:
- https://stackoverflow.com/questions/21297139/how-do-you-sign-a-certificate-signing-request-with-your-certification-authority/21340898#21340898
- https://stackoverflow.com/questions/10175812/how-to-generate-a-self-signed-ssl-certificate-using-openssl
:::

## Configure Nginx

Now, we need to expose the Backend service to the users thanks to an Nginx Reverse Proxy. The Nginx reverse proxy will allow you to setup HTTPS traffic : 
- Install Nginx on your Raspberry Pi or your server by using the [following guide](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04).
- Copy the WIMP proxy configuration file `conf/wimp-proxy` into the Nginx directory `/etc/nginx/sites-available` :
```bash
sudo cp ./ExpressNodeRed/conf/wimp-proxy /etc/nginx/sites-available
```
- Create a symbolic link in the directory `/etc/nginx/sites-enabled` :
```bash
sudo ln -s /etc/nginx/sites-available/wimp-proxy /etc/nginx/sites-enabled
```
- Restart nginx :
```bash
sudo service nginx restart
```

## Test the Backend
Now you can verify that the Backend is well deployed : 
- Connect on the local network
- Open your browser and point it to : https://**Backend IP**/
- Check that you are well redirected on the login page and that the Backend is functional.

Now you can move on to configuring the Frontend part of the WIMP system.