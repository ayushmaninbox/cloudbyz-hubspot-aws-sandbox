const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
let token = '';
let blogId = '';

if (fs.existsSync(envPath)) {
    const fileContent = fs.readFileSync(envPath, 'utf8');
    fileContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (key === 'HUBSPOT_TOKEN') token = val;
            if (key === 'HUBSPOT_BLOG_ID') blogId = val;
        }
    });
}

if (!token || !blogId) {
    console.error("Could not find HUBSPOT_TOKEN or HUBSPOT_BLOG_ID in .env");
    process.exit(1);
}

// Tag mappings on sandbox
const TAGS = {
    cosmetics: "358386886392",
    biotechnology: "358399551183",
    animalHealth: "358386887359"
};

const authorId = "358386887355"; // Ayushman Mohapatra

const postsToCreate = [
    {
        name: `Blog 2`,
        featuredImage: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 2, focusing on global cosmetics packaging rules.`,
        slug: `blog-2`,
        tagIds: [TAGS.cosmetics],
        postSummary: `<p>This is the body content of Blog 2, focusing on global cosmetics packaging rules.</p>`,
        postBody: `<p>This is the body content of Blog 2, focusing on global cosmetics packaging rules.</p>`
    },
    {
        name: `Blog 5`,
        featuredImage: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 5, explaining evolutionary veterinary medicine clinical trials.`,
        slug: `blog-5`,
        tagIds: [TAGS.animalHealth],
        postSummary: `<p>This is the body content of Blog 5, explaining evolutionary veterinary medicine clinical trials.</p>`,
        postBody: `<p>This is the body content of Blog 5, explaining evolutionary veterinary medicine clinical trials.</p>`
    },
    {
        name: `Blog 1`,
        featuredImage: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 1, discussing cosmetics industry compliance and manufacturing.`,
        slug: `blog-1`,
        tagIds: [TAGS.cosmetics],
        postSummary: `<p>This is the body content of Blog 1, discussing cosmetics industry compliance and manufacturing.</p>`,
        postBody: `<p>This is the body content of Blog 1, discussing cosmetics industry compliance and manufacturing.</p>`
    },
    {
        name: `Blog 3`,
        featuredImage: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 3, covering biotechnology cell lines and lab scaling methods.`,
        slug: `blog-3`,
        tagIds: [TAGS.biotechnology],
        postSummary: `<p>This is the body content of Blog 3, covering biotechnology cell lines and lab scaling methods.</p>`,
        postBody: `<p>This is the body content of Blog 3, covering biotechnology cell lines and lab scaling methods.</p>`
    },
    {
        name: `Blog 33`,
        featuredImage: `https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 33, analyzing CRISPR gene editing scales in biotechnology research.`,
        slug: `blog-33`,
        tagIds: [TAGS.biotechnology],
        postSummary: `<p>This is the body content of Blog 33, analyzing CRISPR gene editing scales in biotechnology research.</p>`,
        postBody: `<p>This is the body content of Blog 33, analyzing CRISPR gene editing scales in biotechnology research.</p>`
    },
    {
        name: `Blog 44`,
        featuredImage: `https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 44, exploring biopharma cell line validation processes.`,
        slug: `blog-44`,
        tagIds: [TAGS.biotechnology],
        postSummary: `<p>This is the body content of Blog 44, exploring biopharma cell line validation processes.</p>`,
        postBody: `<p>This is the body content of Blog 44, exploring biopharma cell line validation processes.</p>`
    },
    {
        name: `Blog 11`,
        featuredImage: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 11, focusing on advanced skin care formulas and cosmetics testing.`,
        slug: `blog-11`,
        tagIds: [TAGS.cosmetics],
        postSummary: `<p>This is the body content of Blog 11, focusing on advanced skin care formulas and cosmetics testing.</p>`,
        postBody: `<p>This is the body content of Blog 11, focusing on advanced skin care formulas and cosmetics testing.</p>`
    },
    {
        name: `Blog 55`,
        featuredImage: `https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 55, showcasing canine immunization guidelines and veterinary health.`,
        slug: `blog-55`,
        tagIds: [TAGS.animalHealth],
        postSummary: `<p>This is the body content of Blog 55, showcasing canine immunization guidelines and veterinary health.</p>`,
        postBody: `<p>This is the body content of Blog 55, showcasing canine immunization guidelines and veterinary health.</p>`
    },
    {
        name: `Blog 66`,
        featuredImage: `https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 66, detailing feline diagnostic protocols for companion animal clinics.`,
        slug: `blog-66`,
        tagIds: [TAGS.animalHealth],
        postSummary: `<p>This is the body content of Blog 66, detailing feline diagnostic protocols for companion animal clinics.</p>`,
        postBody: `<p>This is the body content of Blog 66, detailing feline diagnostic protocols for companion animal clinics.</p>`
    },
    {
        name: `Blog 4`,
        featuredImage: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 4, detailing genomic data pipelines in modern biopharma.`,
        slug: `blog-4`,
        tagIds: [TAGS.biotechnology],
        postSummary: `<p>This is the body content of Blog 4, detailing genomic data pipelines in modern biopharma.</p>`,
        postBody: `<p>This is the body content of Blog 4, detailing genomic data pipelines in modern biopharma.</p>`
    },
    {
        name: `Blog 6`,
        featuredImage: `https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 6, exploring electronic data capture for companion livestock studies.`,
        slug: `blog-6`,
        tagIds: [TAGS.animalHealth],
        postSummary: `<p>This is the body content of Blog 6, exploring electronic data capture for companion livestock studies.</p>`,
        postBody: `<p>This is the body content of Blog 6, exploring electronic data capture for companion livestock studies.</p>`
    },
    {
        name: `Blog 22`,
        featuredImage: `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80`,
        metaDescription: `This is the body content of Blog 22, detailing cosmetics manufacturing compliance in the EU and NA.`,
        slug: `blog-22`,
        tagIds: [TAGS.cosmetics],
        postSummary: `<p>This is the body content of Blog 22, detailing cosmetics manufacturing compliance in the EU and NA.</p>`,
        postBody: `<p>This is the body content of Blog 22, detailing cosmetics manufacturing compliance in the EU and NA.</p>`
    },
    {
        name: `Continuous eTMF Inspection Readiness Under ICH E6(R3)`,
        featuredImage: `https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/hs-generated-images/Regulatory%20Leaders%20Reviewing%20TMF%20Dashboard.png`,
        metaDescription: `How Cloudbyz AI eTMF Agent turns E6(R3) and EU CTR inspection readiness into a continuous, portfolio-level discipline.`,
        slug: `resources/continuous-etmf-inspection-readiness-under-ich-e6r3`,
        tagIds: [TAGS.cosmetics, TAGS.animalHealth, TAGS.biotechnology],
        postSummary: `<img src="https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/hs-generated-images/Regulatory%20Leaders%20Reviewing%20TMF%20Dashboard.png" alt="3:2 illustration of Regulatory Affairs and Clinical Operations leaders at a biotech sponsor reviewing a unified Salesforce-style dashboard showing eTMF inspection readiness indicators, ICH E6(R3) compliance status, and country-level TMF health across US and EU trials; charts and maps are visible but not readable, and no logos or brand names appear.">
<p>How Cloudbyz AI eTMF Agent turns E6(R3) and EU CTR inspection readiness into a continuous, portfolio-level discipline.</p>`,
        postBody: `<img src="https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/hs-generated-images/Regulatory%20Leaders%20Reviewing%20TMF%20Dashboard.png" alt="3:2 illustration of Regulatory Affairs and Clinical Operations leaders at a biotech sponsor reviewing a unified Salesforce-style dashboard showing eTMF inspection readiness indicators, ICH E6(R3) compliance status, and country-level TMF health across US and EU trials; charts and maps are visible but not readable, and no logos or brand names appear.">
<p>How Cloudbyz AI eTMF Agent turns E6(R3) and EU CTR inspection readiness into a continuous, portfolio-level discipline.</p>
<!--more-->
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">For Regulatory Affairs leads and Clinical Operations Directors, the question has become impossible to avoid: can your eTMF honestly demonstrate continuous, risk-proportionate inspection readiness, or are you still bridging the gap with pre-inspection cleanup projects?</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Post-2024, every avoidable week of trial slippage carries a measurably higher cost of capital. A TMF that needs last-minute remediation before each inspection or major submission is no longer just a compliance nuisance. It is a structural drag on portfolio velocity.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">ICH E6(R3) and EU CTR have made that drag visible, quantifiable, and increasingly hard to defend.</span></p>
<h2 style="line-height: 1.2; font-size: 18px; text-align: justify;"><strong><span style="color: #1b3a6b;">What E6(R3) and EU CTR Actually Changed</span></strong></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The ICH E6(R3) final guideline, adopted 6 January 2025 and coming into effect in the EU/EEA on 23 July 2025, shifts the organising principle of GCP from document checklists to risk-proportionate quality management.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Three changes matter most for eTMF operations:</span></p>
<ul style="text-align: justify;">
<li><span style="color: #1a1a1a;">Appendix C reframes the Trial Master File around 'essential records'—documents, data, and metadata that facilitate ongoing trial management and enable reconstruction of trial conduct. The word 'records' is deliberate. Metadata, audit trails, and version history are now in scope, not optional.</span></li>
<li><span style="color: #1a1a1a;">Section C.2 requires that essential records be identifiable, version-controlled, and available across sponsor and service-provider systems. Records may live in multiple repositories, but they must form a coherent, navigable evidence trail.</span></li>
<li><span style="color: #1a1a1a;">Section 4.2.3 pulls audit trail review into the QC fabric, requiring it to be planned, risk-based, and documented—not an ad hoc exercise triggered by inspection notice.</span></li>
</ul>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">EU CTR (Regulation 536/2014) layers additional pressure through the CTIS infrastructure, which makes document availability and transparency part of routine operations, not inspection events. Publicly visible trial data and document postings mean sponsors must maintain a coherent evidence trail well before any formal regulatory review.</span></p>
<p style="line-height: 1.2; padding-left: 37.3333px; text-align: justify;"><em><span style="color: #0e7b6b;">TMF operations built around static checklists, quarterly vendor scorecards, and one-off remediation projects cannot credibly meet that bar.</span></em></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">They produce green completeness reports while underlying metadata, version control, and audit behaviour remain brittle. And they do nothing to link TMF health to CTMS milestones and real trial risk.</span></p>
<h2 style="line-height: 1.2; font-size: 18px;"><strong><span style="color: #1b3a6b;">Why Reactive TMF Remediation Keeps Happening</span></strong></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Most Biotech sponsors and mid-size CROs know the pattern well.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">A pivotal oncology or rare-disease trial tracks toward database lock. Governance boards ask, almost reflexively, whether the TMF is ready. What follows is a scramble: extra QC waves, emergency vendor reports, off-cycle remediation projects, and parallel shadow trackers in spreadsheets to work around system blind spots.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The work gets done. But it comes late, it is expensive, and it pulls clinical Operations and Regulatory leaders into operational firefighting precisely when they need to be focused on benefit-risk narratives and submission strategy.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The root cause is architectural, not cultural. In most organisations, the TMF inspection readiness problem looks like this:</span></p>
<ul>
<li><span style="color: #1a1a1a;">Documents arrive from sites, CROs, and partners via email, portals, and shared drives, often without consistent metadata or version discipline.</span></li>
<li><span style="color: #1a1a1a;">CTMS tracks milestones, but its view of documentation is typically limited to status flags surfaced through fragile integrations.</span></li>
<li><span style="color: #1a1a1a;">eTMF platforms hold the documents a regulator will eventually ask to see, but their classification and audit behaviour reflect whichever vendor or CRO operates a given programme.</span></li>
<li><span style="color: #1a1a1a;">Financial and outsourcing realities sit in yet another system.</span></li>
</ul>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">No single place shows you, in real time, how essential records behave relative to milestones and risk. Under E6(R3) and EU CTR, that fragmentation is no longer a tolerable operational inefficiency. It is a compliance gap.</span></p>
<h2 style="line-height: 1.2; font-size: 18px;"><strong><span style="color: #1b3a6b;">From Fragmentation to a Unified Evidence Spine</span></strong></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Closing that gap requires treating TMF evidence as a native part of the operational graph, not a downstream filing exercise.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">That is the design principle behind Cloudbyz, the only 100% Salesforce-native unified eClinical platform in this space. CTMS, eTMF, and Clinical Trial Financials Management (CTFM) all run on the same Salesforce data, security, and audit model. Not integrated. Native.</span></p>
<div align="left">
<table style="border-style: none; border-collapse: collapse; width: 100.722%;"><colgroup><col style="width: 100%;" width="624"></colgroup>
<tbody>
<tr>
<td style="vertical-align: top; background-color: #eaf0fb; border: 0.666667px solid #c0ceea;">
<p style="line-height: 1.2; margin-top: 0px;"><strong><span style="color: #1b3a6b;">What 'native' means in practice:</span></strong></p>
<p style="line-height: 1.2; margin-top: 0px; margin-bottom: 0px;"><span style="color: #1a1a1a;">Studies, countries, and sites are first-class records shared across CTMS, CTFM, and eTMF. CTMS milestones—submissions, approvals, SIVs, FPIs, interim analyses, database lock, close-out—are captured as dated events. TMF artifacts carry rich metadata: TMF Reference Model zone and section, trial, country, site, version, authors, reviewers, approvers, effective dates, and direct relationships to CTMS events. There is no integration layer to maintain and no reconciliation job to run overnight.</span></p>
</td>
</tr>
</tbody>
</table>
</div>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Because all three modules share the same data model, eTMF health can be expressed as a live portfolio signal rather than a static completeness percentage. For a given study and country, you can see which activation and conduct milestones are at risk because essential records are missing, late, or misaligned. For CRO-run or shared eTMFs, you can see where sponsor visibility into critical records is lagging, even when those records are technically present in a vendor system.</span></p>
<h2 style="line-height: 1.2; font-size: 18px;"><strong><span style="color: #1b3a6b;">Where AI Changes the Operating Model</span></strong></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The Cloudbyz AI eTMF Agent is the agentic AI capability that sits at the front of this unified model as an active intake and quality layer.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The distinction matters. Most AI tools in this space surface gaps for humans to act on. The AI eTMF Agent works inside the workflow. It auto-classifies incoming documents against the TMF Reference Model and sponsor- or CRO-specific conventions, applies and normalises metadata, enforces version-control discipline, and runs QC checks for completeness and consistency.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Crucially, for routine issues—misclassified documents, missing mandatory metadata, duplicate filings—it can apply corrections directly and capture those actions in the same audit fabric that governs CTMS and eTMF. More complex cases are escalated to TMF Operations, Regulatory, or Quality with contextual recommendations, not just error codes.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The result is a real-time inspection readiness score that updates continuously as documents flow in, per study, per country, per site. Not a quarterly completeness report. A live view of essential records against the actual conduct of the trial.</span></p>
<p style="line-height: 1.2; text-align: center; padding-left: 37.3333px;"><em><span style="color: #0e7b6b;">Inspection readiness is not a workstream. It is a property of how your eTMF behaves every day.</span></em></p>
<h2 style="line-height: 1.2;"><span style="font-size: 18px;"><strong><span style="color: #1b3a6b;">What Continuous Inspection Readiness Looks Like</span></strong></span></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">For Regulatory Affairs Heads, Clinical Operations Directors, and Quality leads, continuous inspection readiness under E6(R3) and EU CTR has three observable properties:</span></p>
<h3 style="line-height: 1.2; font-size: 16px;"><strong><span style="color: #0e7b6b;">1. Milestone-linked TMF health</span></strong></h3>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">TMF completeness is visible not as an abstract percentage but in the context of CTMS events. When a site initiation visit is logged, the system already knows which essential records should exist and whether they do. When a regulatory submission is approaching, the gap report is generated from live data, not assembled manually.</span></p>
<h3 style="line-height: 1.2; font-size: 16px;"><strong><span style="color: #0e7b6b;">2. Cross-repository oversight</span></strong></h3>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">For CRO-managed programmes or multi-vendor models, sponsor visibility into critical records is real-time, not dependent on vendor reporting cycles. Section C.2 of E6(R3) expects essential records to be available across systems; the Salesforce-native model enforces that expectation operationally rather than contractually.</span></p>
<h3 style="line-height: 1.2; font-size: 16px;"><strong><span style="color: #0e7b6b;">3. Audit-ready by default</span></strong></h3>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">Every AI eTMF Agent action—classification, metadata correction, escalation, QC resolution—is captured in the same audit fabric that underpins Salesforce's compliance with 21 CFR Part 11 and the EMA guideline on computerised systems and electronic data in clinical trials. There is no separate AI audit trail to maintain or reconcile with the eTMF log.</span></p>
<h2 style="line-height: 1.2; font-size: 18px;"><strong><span style="color: #1b3a6b;">The High-Risk Domains That Matter Most</span></strong></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">E6(R3)'s risk-proportionate framing means not all records carry equal inspection risk. The domains that attract the most scrutiny—and therefore benefit most from continuous monitoring—are:</span></p>
<ul>
<li><span style="color: #1a1a1a;">Consent documentation: completeness, version traceability, and timing relative to enrolment events.</span></li>
<li><span style="color: #1a1a1a;">Safety communication records: the chain from SAE capture through investigator notification and regulatory reporting, with metadata confirming timeliness.</span></li>
<li><span style="color: #1a1a1a;">Deviation management: documented detection, assessment, and corrective action, linked to the relevant protocol version and site record.</span></li>
<li><span style="color: #1a1a1a;">Monitoring oversight: site visit reports, follow-up letters, and action item closure, timed against CTMS monitoring milestones.</span></li>
</ul>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">In a Salesforce-native model, the speed at which records appear in these domains relative to CTMS events—and whether their metadata and version control behave in line with quality expectations—is visible in real time. For a sponsor preparing for an EMA inspection or an FDA pre-approval inspection, that visibility is not a convenience feature. It is the difference between walking into an inspection with evidence and walking in with a remediation story.</span></p>
<h2 style="line-height: 1.2; font-size: 18px;"><strong><span style="color: #1b3a6b;">The Practical Implication for Clinical Operations Leaders</span></strong></h2>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">ICH E6(R3) has set a clear expectation: inspection readiness is a continuous state, not a periodic deliverable. EU CTR has made document availability a routine operational requirement, not an inspection-triggered one. And post-2024 funding environments have made the cost of reactive TMF remediation visible at the portfolio level.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">The organisations that will navigate these pressures most effectively are not those that add more QC headcount or more vendor oversight layers. They are the ones that close the architectural gap—where CTMS milestones, TMF evidence chains, and AI-powered quality management operate on a single shared data model, with no integration debt between them.</span></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #1a1a1a;">That is what Cloudbyz was built to deliver.</span></p>
<p style="line-height: 1.2;"><strong><span style="color: #1b3a6b;">About Cloudbyz</span></strong></p>
<p style="line-height: 1.2; text-align: justify;"><span style="color: #555555;">Cloudbyz is the only 100% Salesforce-native unified eClinical platform, delivering CTMS, eTMF, CTFM, EDC, and Safety and Pharmacovigilance on a single shared data model. The Cloudbyz AI eTMF Agent is the confirmed agentic AI capability for continuous TMF inspection readiness. Cloudbyz serves pharma, biotech, and CRO clients across North America, Europe, and APAC.</span></p>`
    },
    {
        name: `Validated AI for Regulatory Affairs: What Sponsors Need to Know Before They Deploy`,
        featuredImage: `https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/Blog2-Hero-Banner-1.png`,
        metaDescription: `Learn how to responsibly implement AI in regulatory submissions, ensuring validation, human oversight, and compliance with industry standards.`,
        slug: `resources/validated-ai-for-regulatory-affairs`,
        tagIds: [TAGS.cosmetics, TAGS.animalHealth, TAGS.biotechnology],
        postSummary: `<p style="font-size: 16px;">The question is no longer whether AI belongs in regulatory submissions. The question is whether the AI your organization is considering can be trusted in a regulated environment.</p>`,
        postBody: `<p style="font-size: 16px;">The question is no longer whether AI belongs in regulatory submissions. The question is whether the AI your organization is considering can be trusted in a regulated environment.</p>
<!--more--><p style="font-size: 16px;">That is a harder question to answer than it sounds, because the word "trust" in a GxP context means something specific. It means the system has been validated. It means the outputs are traceable. It means the humans using the system remain accountable for the decisions it supports. And it means that when an FDA inspector asks how a specific finding was generated, there is a documented, auditable answer.</p>
<p style="font-size: 16px;">This post addresses what sponsors, CROs, and regulatory affairs professionals need to evaluate before deploying AI into the submission process.</p>
<hr>
<h2 style="font-size: 16px;">The Regulatory Framework for AI in Submissions</h2>
<p>&nbsp;</p>
<p><img src="https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/Blog2-Section1-Regulatory-Framework.png" width="1200" height="400" loading="lazy" alt="Blog2-Section1-Regulatory-Framework" style="height: auto; max-width: 100%; width: 1200px;"></p>
<p style="font-size: 16px;">The FDA has been actively developing guidance on AI in regulated contexts, and two frameworks are particularly relevant for submission validation tools.</p>
<p style="font-size: 16px;"><strong>21 CFR Part 11</strong> governs electronic records and electronic signatures. Any AI system used in the submission process must maintain persistent, tamper-evident audit logs of system actions and reviewer decisions. This is not optional. It is the baseline requirement for any tool that touches a regulatory submission record.</p>
<p style="font-size: 16px;"><strong>ICH E6(R3)</strong> and related GCP guidance establish that technology used in clinical and regulatory workflows must be fit for purpose, validated, and operated in accordance with documented procedures. For AI specifically, this translates to requirements for model documentation, change control procedures, and evidence that the system performs as intended under defined conditions.</p>
<p style="font-size: 16px;"><strong>ISO 42001</strong>, the AI management system standard, is increasingly being referenced as a framework for responsible AI governance in life sciences contexts. It addresses AI risk assessment, monitoring, and accountability structures.</p>
<p style="font-size: 16px;">The critical point is that these frameworks do not prohibit AI. They require that AI be implemented with the same rigor applied to any other validated system in the regulatory workflow.</p>
<hr>
<h2 style="font-size: 16px;">The Four Questions to Ask Any AI Regulatory Tool</h2>
<p>&nbsp;</p>
<p><img src="https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/Blog2-Section2-Four-Questions.png" width="1200" height="400" loading="lazy" alt="Blog2-Section2-Four-Questions" style="height: auto; max-width: 100%; width: 1200px;"></p>
<h3 style="font-size: 16px;">1. Is the AI itself validated, and what is the evidence?</h3>
<p style="font-size: 16px;">Validation of an AI system in a regulatory context requires more than functional testing. It requires documented evidence that the system produces consistent, accurate outputs within defined operating conditions, that the model's behavior under edge cases has been tested, and that a plan exists for ongoing monitoring and revalidation as the model is updated.</p>
<p style="font-size: 16px;">For the Cloudbyz AI RegCheck Agent, validation is currently at approximately 80-90% completion, with work ongoing in areas related to complex document edge cases. A credibility report is available, and the validation team is actively engaged with the in-progress FDA guidance on AI credibility assessment. This is a more transparent answer than many vendors will provide. Any vendor that claims full validation without being able to point to specific evidence of what was tested and under what conditions should be pressed for detail.</p>
<h3 style="font-size: 16px;">2. What is the human-in-the-loop design?</h3>
<p style="font-size: 16px;">"Human in the loop" is frequently used as a reassurance phrase without much operational specificity. For a submission validation tool, the meaningful question is: at what points in the workflow does a human have to make a decision, and what happens when they do?</p>
<p style="font-size: 16px;">For the AI RegCheck Agent, the human is always the final decision-maker. The system generates checklists, maps documents, flags compliance issues, and makes recommendations. It does not submit anything, approve anything, or override a reviewer's judgment without explicit human instruction. When a reviewer overrides a finding or marks something as a false positive, that action is logged, attributed to that specific user, and subject to the access controls defined by the organization.</p>
<p style="font-size: 16px;">This design is meaningful because it means the AI is in an advisory role throughout. The regulatory team retains full accountability for the submission.</p>
<h3 style="font-size: 16px;">3. How is AI learning controlled to prevent compliance drift?</h3>
<p style="font-size: 16px;">Machine learning systems that improve based on user feedback introduce a specific risk: the feedback loop can introduce organizational bias or errors into the model's future behavior. In a regulated context, this needs to be controlled.</p>
<p style="font-size: 16px;">The AI RegCheck Agent addresses this through two mechanisms. First, when a user provides feedback, the system determines whether that feedback reflects an organizational workflow preference (stored at the org level, applied to future submissions) or a project-specific decision (stored at the project level, reset for new projects). This prevents local decisions from inadvertently shaping the system's global behavior.</p>
<p style="font-size: 16px;">Second, role-based access controls determine who can provide feedback that influences the model. Not every team member can mark a compliance flag as a false positive. Those permissions are configured at the organizational level and are part of the system's accountability structure.</p>
<h3 style="font-size: 16px;">4. What audit trail does the system maintain?</h3>
<p style="font-size: 16px;">For inspection purposes, the audit trail is the evidence. A system that documents how it generated them is not suitable for regulated use.</p>
<p style="font-size: 16px;">The AI RegCheck Agent maintains two parallel audit trails: one for human actions (who uploaded what, who reviewed what, who approved or overrode what, and when) and one for AI outputs (what the model flagged, what it recommended, and what version of the model generated each output). Prompt versioning ensures that the exact state of the model at the time of any given decision can be reconstructed if needed.</p>
<p style="font-size: 16px;">PHI checks are built into the document processing layer, relevant for any submission involving patient-level data.</p>
<hr>
<h2 style="font-size: 16px;">The Pilot Program Approach: Why It Matters</h2>
<p>&nbsp;</p>
<p><img src="https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/Blog2-Section3-Pilot-Program.png" width="1200" height="400" loading="lazy" alt="Blog2-Section3-Pilot-Program" style="height: auto; max-width: 100%; width: 1200px;"></p>
<p style="font-size: 16px;">The most practical advice for organizations evaluating AI submission tools is to begin with a historical submission, not a live one.</p>
<p style="font-size: 16px;">Select a submission that your team knows had issues. One where you received an FDA deficiency letter, a CRL, or significant internal QC findings. Upload the package into the system. Run the validation. Then evaluate whether the system would have caught the same issues your team eventually identified, and what additional gaps it flags that were not caught.</p>
<p style="font-size: 16px;">This approach has several advantages. It is low-risk because the submission is already closed. It gives your team a realistic baseline for evaluating the system's accuracy. And it identifies any configuration or customization work that would be needed before the system is used on active submissions.</p>
<p style="font-size: 16px;">The Cloudbyz AI RegCheck Agent can be set up within a week for an out-of-the-box deployment. Organizations with specific configuration requirements typically need two to two and a half weeks from agreement to working system.</p>
<hr>
<h2 style="font-size: 16px;">What Responsible AI Deployment Looks Like</h2>
<p>&nbsp;</p>
<p><img src="https://39682494.fs1.hubspotusercontent-na1.net/hubfs/39682494/Blog2-Section4-Responsible-Deployment.png" width="1200" height="400" loading="lazy" alt="Blog2-Section4-Responsible-Deployment" style="height: auto; max-width: 100%; width: 1200px;"></p>
<p style="font-size: 16px;">Deploying AI into regulatory workflows responsibly means treating the AI system the way you would treat any other validated system in your quality management framework. That means:</p>
<p style="font-size: 16px;">A documented validation plan with defined acceptance criteria before the system is used in production.</p>
<p style="font-size: 16px;">A change control procedure for model updates, including testing requirements and re-validation thresholds.</p>
<p style="font-size: 16px;">Defined user roles and access controls that determine who can interact with the system's learning mechanisms.</p>
<p style="font-size: 16px;">A regular review of AI outputs against expected behavior, with a process for reporting and addressing anomalies.</p>
<p style="font-size: 16px;">A plan for what happens when the system flags something unexpected, and clear procedures for overrides, justifications, and escalations.</p>
<p style="font-size: 16px;">None of this is unique to AI. It is the same framework applied to any validated system in a regulated environment. What AI adds is the need for additional attention to the training data, the model update cycle, and the human-in-the-loop design.</p>
<hr>
<h2 style="font-size: 16px;">The Bottom Line</h2>
<p style="font-size: 16px;">AI can be trusted in regulatory submissions when it is implemented with the rigor that regulated environments require. That rigor includes validation evidence, human oversight at every decision point, controlled learning mechanisms, and auditable records.</p>
<p style="font-size: 16px;">The organizations that will benefit most from AI submission tools are the ones that treat AI adoption as a quality management initiative, not just a technology procurement.</p>
<hr>
<p style="font-size: 16px;"><em>To learn more about the Cloudbyz AI RegCheck Agent, the validation approach, and the pilot program process, contact <a href="mailto:info@cloudbyz.com">info@cloudbyz.com</a> or visit <a href="http://www.cloudbyz.com/">www.cloudbyz.com</a>. Cloudbyz is ISO 9001 and ISO 27001 certified and fully compliant with FDA 21 CFR Part 11, GCP, and HIPAA.</em></p>`
    },
];

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let resBody = '';
            res.on('data', chunk => resBody += chunk);
            res.on('end', () => {
                let decoded = null;
                try {
                    decoded = JSON.parse(resBody);
                } catch (e) {
                    decoded = resBody;
                }
                if (res.statusCode >= 400) {
                    reject(new Error(`HTTP ${res.statusCode}: ${decoded.message || resBody}`));
                } else {
                    resolve(decoded);
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function createPost(post) {
    const body = {
        name: post.name,
        htmlTitle: post.name,
        postBody: post.postBody,
        postSummary: post.postSummary,
        metaDescription: post.metaDescription,
        featuredImage: post.featuredImage,
        useFeaturedImage: true,
        contentGroupId: blogId,
        blogAuthorId: authorId,
        tagIds: post.tagIds,
        slug: post.slug,
        state: "PUBLISHED"
    };

    const options = {
        hostname: 'api.hubapi.com',
        path: '/cms/v3/blogs/posts',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const result = await request(options, body);
        console.log(`Successfully published: ${post.name} (ID: ${result.id})`);
    } catch (e) {
        console.error(`Failed to publish ${post.name}: ${e.message}`);
    }
}

async function run() {
    for (const post of postsToCreate) {
        await createPost(post);
        // Sleep 1 second to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("Completed publishing all blogs.");
}

run();
