# Manual by Script 

### 1. Install typescript globally
```shell script
npm i -g typescript
```

### 2. Download the repository
```shell script
git clone git@github.com:davydovMikhail/degen-test.git
```

### 3. Open the repository and install dependencies
```shell script
cd degen-test
```
```shell script
npm i
```

### 4. Fill in the file src/wallets.txt without spaces as in the example
```txt
9e0395da9029a86636e464d19f79df91adf3f668a077ccebf2bb98700b835b82
f35228f2419066fe118bf6f9593a7c1925184581300ec3b9730e2d6912a9873e
5acb8518b04f3936be4fe4362bb11222f09b8a3c06ed48404aacd23a1f06719e
6d74f26c626a6fb78814806857dc11c5e7311c1c7a5229c23994c71a3cf9190a
c0324e9a843aef4cc1a61895c9fc9138a2f6f0e2e0da5889904d7902aa027196
```

### 5. Fill in the src/config.json configuration file
```json
{
    "randomMode": true, // random wallet selection mode
    "fromDelay": 2, // lower delay range (seconds)
    "toDelay": 4, // upper delay range (seconds)
    "fromAmount": 0.1, // the lower range of the ETH amount
    "toAmount": 1.9 // the upper range of the ETH amount
}
```

### 6. Build script
```shell script
npm run build
```

### 7. Start script
```shell script
npm run start
```

### 8. See logs

