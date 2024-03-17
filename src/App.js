
import React, { useState } from 'react';
import { XRPLClient, Wallet } from '@nice-xrpl/react-xrpl';
import { create as ipfsHttpClient } from 'ipfs-http-client';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nftId, setNftId] = useState(null);

  const ipfs = ipfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }); // Replace with your IPFS provider

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setError(null); // Clear any previous errors
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      setError('Please select an image to convert.');
      return;
    }

    if (!nftName || !nftDescription) {
      setError('Please provide a name and description for your NFT.');
      return;
    }

    setLoading(true);

    try {
      // Upload image to IPFS
      const imageIpfsHash = await uploadImageToIpfs(ipfs, selectedImage);

      // Create NFT transaction
      const nftId = await createNftTransaction(imageIpfsHash, nftName, nftDescription);

      setNftId(nftId);
    } catch (error) {
      console.error('Error converting image to NFT:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToIpfs = async (ipfsClient, image) => {
    const added = await ipfsClient.add(image);
    return added.path;
  };

  const createNftTransaction = async (imageIpfsHash, nftName, nftDescription) => {
    const client = new XrpClient('wss://s.altnet.rippletest.net:51233'); // Testnet connection
    await client.connect();

    const wallet = Wallet.fromSeed('YOUR_SECRET_KEY', { network: XrpNetwork.Test });

    // Replace with actual NFT minting logic using XRPL API
    // Refer to XRPL documentation for guidance on creating NFT tokens.
    // This is a simplified example for illustration purposes.
    const transaction = await client.prepareTransaction({
      from: wallet.address,
      // ... other transaction fields
      // Set appropriate fields for NFT minting
      metaData: {
        image: `ipfs://${imageIpfsHash}`,
        name: nftName,
        description: nftDescription,
      },
    });

    const signedTransaction = wallet.sign(transaction);
    const response = await client.submitAndWait(signedTransaction);

    return response.hash; // Placeholder for actual NFT token ID
  };

  return (
    <XRPLClient address="YOUR_WALLET_ADDRESS">
      <div>
        <h1>Convert Image to NFT on XRPL</h1>
        <form onSubmit={handleFormSubmit}>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <input type="text" placeholder="NFT Name" value={nftName} onChange={(e) => setNftName(e.target.value)} />
          <textarea placeholder="NFT Description" value={nftDescription} onChange={(e) => setNftDescription(e.target.value)} />
          <button type="submit" disabled={loading}>
            {loading ? 'Converting...' : 'Convert to NFT'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {nftId && <p>NFT ID: {nftId}</p>}
      </div>
    </XRPLClient>
  );
};

export default App;