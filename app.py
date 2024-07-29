from flask import Flask, request, jsonify, redirect
import base64
from ton_client.client import TonClient, DEVNET_BASE_URL
from ton_client.types import ParamsOfEncodeMessage, CallSet, Signer, KeyPair

app = Flask(__name__)

@app.route('/generate-url', methods=['GET'])
def generate_url():
    # Get parameters from the request
    public_key = request.args.get('public_key')
    address = request.args.get('address')
    recipient_address = "EQCh031TpoRtdrxxr0KJUh8gnEkJbV3iNw9QK-daH0dU9HJV"
    amount = 100 * 10**9  # Amount in nanograms

    # Initialize TON client
    client = TonClient(config={"network": {"server_address": DEVNET_BASE_URL}})
    payload = ""

    # Create the message
    keypair = KeyPair(public=public_key, secret="")  # No need for the private key
    params = ParamsOfEncodeMessage(
        abi=None,
        address=address,
        call_set=CallSet(
            function_name="sendTransaction",
            input={"dest": recipient_address, "value": amount, "bounce": False, "payload": payload}
        ),
        signer=Signer.External(keypair.public)
    )

    encoded_message = client.abi.encode_message(params=params)
    serialized_boc = client.boc.encode_boc(params={"data": encoded_message.message})
    base64_boc = base64.b64encode(serialized_boc.boc).decode('utf-8')

    tonkeeper_url = f"https://app.tonkeeper.com/transfer/{recipient_address}?amount={amount}&bin={base64_boc}"
    return redirect(tonkeeper_url)

if __name__ == '__main__':
    app.run(debug=True)