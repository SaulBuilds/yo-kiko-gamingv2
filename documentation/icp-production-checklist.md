# ICP Production Deployment Checklist

This checklist ensures that all Internet Computer Protocol integrations are properly configured for production deployment.

## Environment Variables

- [ ] `VITE_ICP_IDENTITY_PROVIDER_URL` set to `https://identity.ic0.app` for mainnet
- [ ] `VITE_GAME_BET_CANISTER_ID` set to your deployed GameBet canister ID
- [ ] `VITE_EVM_RPC_CANISTER_ID` set to the ICP mainnet EVM RPC canister ID
- [ ] `VITE_ICP_HOST` set to `https://ic0.app` for mainnet
- [ ] `VITE_ALCHEMY_API_KEY` set with valid Alchemy API key for Ethereum interactions
- [ ] `VITE_ETH_NETWORK` set to appropriate network (`mainnet`, `goerli`, or `sepolia`)
- [ ] `WS_SECRET` set with a secure random string for WebSocket message signing

## Feature Flags

- [ ] Review `VITE_ENABLE_ICP_BETTING` flag (defaults to `true`)
- [ ] Review `VITE_ENABLE_ETH_BETTING` flag (defaults to `true`)
- [ ] Review `VITE_ENABLE_ICP_AUTH` flag (defaults to `true`)

## Canister Deployment

- [ ] GameBet canister deployed to IC mainnet
- [ ] Canister has appropriate cycles allocated (at least 20T cycles recommended)
- [ ] Canister controller identity properly secured
- [ ] Canister ID recorded and added to environment variables

## Security Checks

- [ ] All placeholder canister IDs removed from codebase
- [ ] Environment variable validation in place for required values
- [ ] Authentication flow tested with Internet Identity on mainnet
- [ ] Device fingerprinting properly generates unique IDs
- [ ] Error handling implemented for all ICP interactions
- [ ] Threshold ECDSA flow tested end-to-end with real ETH values

## Database Schemas

- [ ] Database schema updated to include compound constraints for `walletAddress` and `deviceId`
- [ ] Migration applied to production database

## WebSocket Implementation

- [ ] WebSocket server configured for secure connections
- [ ] Message signing implemented with `WS_SECRET`
- [ ] Reconnection logic tested for stability

## User Experience

- [ ] Loading states implemented for all ICP interactions
- [ ] Error messages are user-friendly and actionable
- [ ] Success notifications implemented for bet actions
- [ ] Real-time updates flow correctly through WebSockets

## Documentation

- [ ] README updated with ICP deployment instructions
- [ ] ICP authentication flow documented for users
- [ ] API documentation updated to include ICP endpoints

## Monitoring & Logging

- [ ] Logging implemented for ICP canister interactions
- [ ] Error tracking set up for ICP-related errors
- [ ] Monitoring in place for WebSocket connections
- [ ] Canister cycle usage monitoring configured

## Backups & Recovery

- [ ] Canister backup procedure documented
- [ ] Recovery process tested and documented
- [ ] Emergency contact information updated

## Final Steps

- [ ] Complete end-to-end test of the entire betting flow with ICP
- [ ] Verify no hardcoded values or placeholders remain
- [ ] Confirm all API keys and secrets are stored securely
- [ ] Schedule post-deployment verification

## Notes

Use this section to record any special considerations or known issues that need monitoring after deployment:

1. Monitor threshold ECDSA response times during high load
2. Watch for any unexpected Internet Identity authentication failures
3. Check WebSocket reconnection behavior in unreliable network conditions