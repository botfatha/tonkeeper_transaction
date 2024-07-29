const express = require('express');
const axios = require('axios');
const { TonClient } = require("@tonclient/core");
const { libWeb } = require("@tonclient/lib-web");
TonClient.useBinaryLibrary(libWeb);

const app = express();

app.get('/auth', (req, res) => {
    try {
        const callbackUrl = `${req.protocol}://${req.get('host')}/callback`;
        const tonkeeperUrl = `ton://connect?callback=${callbackUrl}`;
        res.redirect(tonkeeperUrl);
    } catch (error) {
        console.error(`Error in /auth: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/callback', (req, res) => {
    try {
        const { public_key, address } = req.query;
        const generateUrl = `${req.protocol}://${req.get('host')}/generate-url?public_key=${public_key}&address=${address}`;
        res.redirect(generateUrl);
    } catch (error) {
        console.error(`Error in /callback: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/generate-url', async (req, res) => {
    try {
        const { public_key, address } = req.query;
        const recipientAddress = "EQCh031TpoRtdrxxr0KJUh8gnEkJbV3iNw9QK-daH0dU9HJV";
        const amount = 100 * 10**9; // Amount in nanograms

        const payload = "";
        const tonClientUrl = "https://testnet.ton.dev";
        const client = new TonClient({ network: { server_address: tonClientUrl } });

        const params = {
            abi: {
                type: "Contract",
                value: {
                    functions: [],
                    events: [],
                    data: []
                }
            },
            address: address,
            call_set: {
                function_name: "sendTransaction",
                input: { dest: recipientAddress, value: amount, bounce: false, payload: payload }
            },
            signer: { type: "None" }
        };

        const { message } = await client.abi.encode_message(params);
        const { boc } = await client.boc.encode_boc({ boc: [message] });
        const base64Boc = Buffer.from(boc[0]).toString('base64');

        const tonkeeperUrl = `https://app.tonkeeper.com/transfer/${recipientAddress}?amount=${amount}&bin=${base64Boc}`;
        res.redirect(tonkeeperUrl);
    } catch (error) {
        console.error(`Error in /generate-url: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});