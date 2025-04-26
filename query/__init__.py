# query package initialization
__version__ = '1.0.0'

import os
import logging

# Setup basic logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Print basic information about the package location
logger.debug(f"Query package loaded from: {os.path.dirname(os.path.abspath(__file__))}")

from .prepare_rag import LegalRAG

__all__ = ['LegalRAG'] 